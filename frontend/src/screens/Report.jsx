import { Printer } from 'lucide-react';
import { useLayoutEffect, useState, useRef } from 'react';
import { sendJSON, getData } from '@/utils/send';
import { urls, apiUrl } from '@/constants/urls';
import { formattedDate, formatDateToLong } from '@/utils/datetime';
import { toNumber, formattedCurrency } from '@/utils/number';

import Select from '@/components/DropDown';
import CalendarPicker from '@/components/CalendarPicker';
import Loading from '@/components/Loading';

const Report = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('Daily');

    const [selectedYear, setSelectedYear] = useState(''); // I also used it for selecting months for monthly report
    const [selectedYearData, setSelectedYearData] = useState([]);

    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedMonthData, setSelectedMonthData] = useState([]);

    const [selectedDate, setSelectedDate] = useState(new Date().getTime()); // ui
    const [soldItemsToShow, setSoldItemsToShow] = useState([]);
    const [expensesToShow, setExpensesToShow] = useState([]);

    const [totalCollection, setTotalCollection] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [netCash, setNetCash] = useState(0);

    const [loading, setLoading] = useState(false);

    const componentRef = useRef(null);

    const today = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const YEAR_STARTED = 2024;

    const handleCaptureHTMLAndPrintPDF = async () => {
        try {
            setLoading(true);
            if (componentRef.current) {
                const outerHTML = componentRef.current.outerHTML;

                const payload = { html: outerHTML };
                const response = await sendJSON(urls.printpdf, payload);
                if(response) {
                    const fileName = response?.fileName;
                    const fulltUrl = `${apiUrl}/reports/${fileName}`;
                    window.open(fulltUrl, '_blank');
                }
            }
        } catch (error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    const mergeResemblance = (items) => {
        const itemKeys = {};
        for (const item of items) {
            const supplierNameKey = String(item?.supplierName).trim().toLowerCase();
            const projectTypeKey = String(item?.productTypeName).trim().toLowerCase();
            const descriptionKey = String(item?.itemDescription).trim().toLowerCase();
            const paymentMethodKey = String(item?.paymentMethod).trim().toLowerCase();
            const nKey = `${supplierNameKey}-${projectTypeKey}-${descriptionKey}-${paymentMethodKey}`;

            const nAmount = !item?.isDiscounted ? item?.srp : item?.maxDiscount;
            const itemObject = {
                ...item, quantity: 1,
                totalAmount: toNumber(nAmount)
            };
            if (itemKeys[nKey]) {
                itemObject.quantity++;
                itemObject.totalAmount = itemObject.totalAmount + itemKeys[nKey].totalAmount;
            }
            itemKeys[nKey] = itemObject;
        }
        return Object.values(itemKeys);
    }

    const selectYear = async (year) => {
        try {
            setLoading(true);
            setSelectedYear(year);

            const payload = { year };
            const response = await sendJSON(urls.yearlyreport, payload);
            if (response) {
                const data = response?.results;
                // console.log(data);
                setSelectedYearData(data);

                let totalCol = 0;
                let totalExp = 0;
                // the total of net income will be computed in useLayoutEffect
                for (const details of data) {
                    totalCol = toNumber(totalCol + details?.totalCollection);
                    totalExp = toNumber(totalExp + details?.totalExpenses);
                }
                setTotalCollection(totalCol);
                setTotalExpenses(totalExp);
            }
        } catch (error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    const selectMonth = async (month, index) => {
        try {
            setLoading(true);
            setSelectedMonth(month);

            const payload = { year: selectedYear, month: index };
            const response = await sendJSON(urls.monthlyreport, payload);
            if (response) {
                const data = response?.results;
                // console.log(data);
                setSelectedMonthData(data);

                let totalCol = 0;
                let totalExp = 0;
                // the total of net income will be computed in useLayoutEffect
                for (const details of data) {
                    totalCol = toNumber(totalCol + details?.totalCollection);
                    totalExp = toNumber(totalExp + details?.totalExpenses);
                }
                setTotalCollection(totalCol);
                setTotalExpenses(totalExp);
            }
        } catch (error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    // daily
    const selectDate = async (value) => {
        try {
            setLoading(true);
            const payload = { date: value };
            const response = await sendJSON(urls.dateofreport, payload);
            if (response) {
                // console.log(response?.results);
                const { expenses, soldItems } = response?.results;

                let totalExp = 0;
                for (const expense of expenses) {
                    totalExp = totalExp + toNumber(expense?.amount);
                }

                const nSoldItems = mergeResemblance(soldItems);
                let totalColl = 0;
                for (const soldItem of nSoldItems) {
                    totalColl = totalColl + soldItem?.totalAmount;
                }

                setExpensesToShow(expenses);
                setSoldItemsToShow(nSoldItems);
                setTotalExpenses(totalExp);
                setTotalCollection(totalColl);
            }
        } catch (error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
            setSelectedDate(value);
        }
    }

    const getSoldItemsToday = async () => {
        try {
            setLoading(true);
            const response = await getData(urls.solditemstoday);
            if (response) {
                const data = response?.results;
                const nData = mergeResemblance(data);
                let total = 0;
                for (const soldItem of nData) {
                    total = total + soldItem?.totalAmount;
                }
                setSoldItemsToShow(nData);
                setTotalCollection(total);
            }
        } catch (error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    const getExpensesToday = async () => {
        try {
            setLoading(true);
            const response = await getData(urls.getexpensestoday);
            if (response) {
                // console.log(response);
                const data = response?.results;
                let total = 0;
                for (const expense of data) {
                    total = total + toNumber(expense?.amount);
                }

                setExpensesToShow(data);
                setTotalExpenses(total);
            }
        } catch (error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        const net = toNumber(totalCollection) - toNumber(totalExpenses);
        setNetCash(net);
    }, [totalExpenses, totalCollection]);

    useLayoutEffect(() => {
        if (selectedPeriod) {
            setTotalCollection(0);
            setTotalExpenses(0);
        }
    }, [selectedPeriod]);

    useLayoutEffect(() => {
        getSoldItemsToday();
        getExpensesToday();
    }, []);

    if (loading) {
        return (
            <Loading customStyle="w-full h-screen" />
        )
    }

    return (
        <main className="absolute top-0 
            left-admin-sidebar-sm lg:left-admin-sidebar-lg 
            w-[calc(100vw-var(--admin-sidebar-width-sm))] lg:w-[calc(100vw-var(--admin-sidebar-width-lg))] 
            h-screen bg-neutral-100 p-4 lg:px-6
            flex flex-col"
        >
            <section className="">
                <h1 className="text-xl font-bold">Business Report</h1>
            </section>
            <section className="grow w-full h-full relative">
                <div className="w-full absolute top-0 left-0 right-0 bottom-0 mt-2 overflow-hidden">
                    <div className="flex py-1  px-2 rounded-lg bg-white mb-2 mr-1">
                        <div className="w-full h-full flex items-center space-x-2">
                            <Select
                                name={`${selectedPeriod || 'Select Period'}`}
                                className="w-fit py-2 max-h-[40px] rounded-lg border-2 border-neutral-400 z-20"
                            >
                                <button
                                    onClick={() => setSelectedPeriod('Daily')}
                                    className="text-nowrap text-[16px] p-2 px-4 rounded-lg hover:bg-gray-200 overflow-x-hidden text-ellipsis flex gap-2 items-center">
                                    Daily
                                </button>
                                <button
                                    onClick={() => setSelectedPeriod('Monthly')}
                                    className="text-nowrap text-[16px] p-2 px-4 rounded-lg hover:bg-gray-200 overflow-x-hidden text-ellipsis flex gap-2 items-center">
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setSelectedPeriod('Yearly')}
                                    className="text-nowrap text-[16px] p-2 px-4 rounded-lg hover:bg-gray-200 overflow-x-hidden text-ellipsis flex gap-2 items-center">
                                    Yearly
                                </button>
                            </Select>
                            {selectedPeriod === 'Daily' ?
                                <CalendarPicker callback={selectDate} selectedDate={selectedDate} />
                                :
                                selectedPeriod === 'Monthly' ?
                                    <>
                                        <Select
                                            name={`${selectedYear || 'Select Year'}`}
                                            className="w-fit py-2 max-h-[40px] rounded-lg border-2 border-neutral-400 z-20"
                                        >
                                            {Array(today.getFullYear() - YEAR_STARTED + 1).fill(0)?.map((_, index) => {
                                                const nYear = YEAR_STARTED + index;
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => setSelectedYear(nYear)}
                                                        className="text-nowrap text-[16px] p-2 px-4 rounded-lg hover:bg-gray-200 overflow-x-hidden text-ellipsis flex gap-2 items-center"
                                                    >
                                                        {nYear}
                                                    </button>
                                                )
                                            })}
                                        </Select>
                                        <Select
                                            name={`${selectedMonth || 'Select Month'}`}
                                            className="w-fit py-2 max-h-[40px] rounded-lg border-2 border-neutral-400 z-20"
                                        >
                                            {months?.map((month, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => selectMonth(month, index)}
                                                    className="text-nowrap text-[16px] p-2 px-4 rounded-lg hover:bg-gray-200 overflow-x-hidden text-ellipsis flex gap-2 items-center"
                                                >
                                                    {month}
                                                </button>
                                            ))}
                                        </Select>
                                    </>
                                    :
                                    selectedPeriod === 'Yearly' ?
                                        <Select
                                            name={`${selectedYear || 'Select Year'}`}
                                            className="w-fit py-2 max-h-[40px] rounded-lg border-2 border-neutral-400 z-20"
                                        >
                                            {Array(today.getFullYear() - YEAR_STARTED + 1).fill(0)?.map((_, index) => {
                                                const nYear = YEAR_STARTED + index;
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => selectYear(nYear)}
                                                        className="text-nowrap text-[16px] p-2 px-4 rounded-lg hover:bg-gray-200 overflow-x-hidden text-ellipsis flex gap-2 items-center"
                                                    >
                                                        {nYear}
                                                    </button>
                                                )
                                            })}
                                        </Select>
                                        :
                                        <></>
                            }
                        </div>
                        <button
                            onClick={handleCaptureHTMLAndPrintPDF}
                            className="flex gap-2 items-center justify-center leading-none bg-green-600 text-white font-bold rounded-lg p-2 sm:px-4 hover:bg-green-800"
                        >
                            <Printer />
                            <span className="hidden sm:flex text-nowrap">Print</span>
                        </button>
                    </div>
                    <div className="w-full h-full
                        pb-32 pr-1
                        overflow-auto
                        [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-track]:rounded-lg
                        [&::-webkit-scrollbar-track]:bg-gray-100
                        [&::-webkit-scrollbar-thumb]:rounded-lg
                        [&::-webkit-scrollbar-thumb]:bg-gray-300
                    ">
                        <div ref={componentRef}>
                            {selectedPeriod === 'Daily' ?
                                <>
                                    {/* Cash Breakdown */}
                                    {/* <div className="bg-white p-4 shadow-md rounded-lg mb-2">
                                        <h2 className="text-lg font-semibold mb-4">Cash Breakdown</h2>
                                        <table className="w-full border-collapse border border-gray-200">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="border px-4 py-2">Denomination</th>
                                                    <th className="border px-4 py-2">No. of Pieces</th>
                                                    <th className="border px-4 py-2">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="border px-4 py-2">₱1,000</td>
                                                    <td className="border px-4 py-2">51</td>
                                                    <td className="border px-4 py-2">₱51,000</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div> */}

                                    {/* Sales Summary */}
                                    <div className="w-full bg-white p-4 shadow-md rounded-lg mb-2">
                                        <h2 className="text-lg font-semibold mb-4">Sales Summary ({formatDateToLong(new Date(selectedDate))})</h2>
                                        <table className="w-full border-collapse border border-gray-200">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="border px-4 py-2">Supplier</th>
                                                    <th className="border px-4 py-2">Item Name</th>
                                                    <th className="border px-4 py-2">Qty</th>
                                                    {/* <th className="border px-4 py-2">Sold Date</th> */}
                                                    <th className="border px-4 py-2">Current</th>
                                                    <th className="border px-4 py-2">Mode of Payment</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {soldItemsToShow?.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="border px-4 py-2">{item?.supplierName}</td>
                                                        <td className="border px-4 py-2">{item?.productTypeName} {item?.itemDescription}</td>
                                                        <td className="border px-4 py-2">{toNumber(item?.quantity)}</td>
                                                        {/* <td className="border px-4 text-center">{formattedDate(new Date(item?.soldAt))}</td> */}
                                                        <td className="border px-4 py-2">{formattedCurrency(item?.totalAmount)}</td>
                                                        <td className="border px-4 py-2">{item?.paymentMethod}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Expense Summary */}
                                    <div className="bg-white p-4 shadow-md rounded-lg mb-2">
                                        <h2 className="text-lg font-semibold mb-4">Expense Summary</h2>
                                        <ul className="list-disc list-inside">
                                            {expensesToShow?.map((item, index) => (
                                                <li key={index}>
                                                    {item?.type}:&nbsp;&nbsp;&nbsp;{formattedCurrency(item?.amount)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                                :
                                selectedPeriod === 'Monthly' ?
                                    <>
                                        <div className="bg-white p-4 shadow-md rounded-lg mb-2">
                                            <h2 className="text-lg font-semibold mb-4">{selectedMonth} {selectedYear} Sales Summary</h2>
                                            <table className="w-full border-collapse border border-gray-200">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        <th className="border px-4 py-2">Date</th>
                                                        <th className="border px-4 py-2">Total Sales</th>
                                                        <th className="border px-4 py-2">Total Expenses</th>
                                                        <th className="border px-4 py-2">Net Income</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedMonthData?.map((item, index) => {
                                                        return (
                                                            <tr key={index}>
                                                                <td className="border px-4 text-center">{formattedDate(new Date(item?.date))}</td>
                                                                <td className="border px-4 py-2">{formattedCurrency(item?.totalCollection)}</td>
                                                                <td className="border px-4 py-2">{formattedCurrency(item?.totalExpenses)}</td>
                                                                <td className="border px-4 py-2">{formattedCurrency(item?.netIncome)}</td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                    :
                                    selectedPeriod === 'Yearly' &&
                                    <>
                                        <div className="bg-white p-4 shadow-md rounded-lg mb-2">
                                            <h2 className="text-lg font-semibold mb-4">Sales Summary for Year {selectedYear}</h2>
                                            <table className="w-full border-collapse border border-gray-200">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        <th className="border px-4 py-2">Month</th>
                                                        <th className="border px-4 py-2">Total Sales</th>
                                                        <th className="border px-4 py-2">Total Expenses</th>
                                                        <th className="border px-4 py-2">Net Income</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedYearData?.map((item, index) => {
                                                        return (
                                                            <tr key={index}>
                                                                <td className="border px-4 text-center">{item?.month}</td>
                                                                <td className="border px-4 py-2">{formattedCurrency(item?.totalCollection)}</td>
                                                                <td className="border px-4 py-2">{formattedCurrency(item?.totalExpenses)}</td>
                                                                <td className="border px-4 py-2">{formattedCurrency(item?.netIncome)}</td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                            }

                            {/* Net Summary */}
                            <div className="bg-white p-4 shadow-md rounded-lg">
                                <h2 className="text-lg font-semibold">Net Summary</h2>
                                <p>Total Collection: {formattedCurrency(totalCollection)}</p>
                                <p>Total Expenses: {formattedCurrency(totalExpenses)}</p>
                                <p className="font-bold">Net Cash Available: {formattedCurrency(netCash)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Report;
