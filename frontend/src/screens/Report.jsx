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

    const [cashDenominations, setCashDenominations] = useState({pieces: {}, totals: {}});
    const [denominationTotal, setDenominationTotal] = useState(0);

    const [selectedDate, setSelectedDate] = useState(new Date().getTime()); // ui
    const [soldItemsToShow, setSoldItemsToShow] = useState([]);
    const [expensesToShow, setExpensesToShow] = useState([]);

    const [grossSales, setGrossSales] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [netCash, setNetCash] = useState(0);

    const [totalNonCashPayments, setTotalNonCashPayments] = useState(0);

    const [discrepancy, setDiscrepancy] = useState(0);

    const [loading, setLoading] = useState(false);

    const componentRef = useRef(null);

    const today = new Date();
    const wordToNumberDenomination = {onethousand: 1000, fivehundred: 500, twohundred: 200, onehundred: 100, fifty: 50, twenty: 20, ten: 10, five: 5, one: 1};
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
                    const fulltUrl = `${apiUrl}/fl/reports/${fileName}`;
                    window.open(fulltUrl, '_blank');
                }
            }
        } catch (error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    const transferCashDenominations = (cashDenominations) => {
        const contents = {onethousand: 0, fivehundred: 0, twohundred: 0, onehundred: 0, fifty: 0, twenty: 0, ten: 0, five: 0, one: 0};
        const nDenominations = {...contents};
        const nTotals = {...contents};
        for(const key in cashDenominations) {
            const denom = toNumber(cashDenominations[key]);
            const nKey = String(key).toLowerCase().trim();
            nDenominations[nKey] = denom;
            const eachDenomTotal = denom * wordToNumberDenomination[nKey];
            nTotals[nKey] = eachDenomTotal;
        }
        setCashDenominations({pieces: nDenominations, totals: nTotals});
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

    const monthlyNYearlySummary = (data) => {
        let gross = 0;
        let totalCash = 0;
        let totalNonCash = 0;
        let totalExp = 0;
        let denomTotal = 0;
        let discrep = 0
        // the total of net income will be computed in useLayoutEffect
        for (const details of data) {
            gross = gross + details?.grossSales;
            totalCash = totalCash + details?.cashPayments;
            totalNonCash = totalNonCash + details?.nonCashPayments;

            totalExp = totalExp + details?.totalExpenses;
            denomTotal = denomTotal + details?.cashDenominationsTotal;
            discrep = discrep + details?.discrepancy;
        }
        setGrossSales(gross); // cash + non-cash would work but in backend expenses were deducted
        setNetCash(totalCash);
        setTotalNonCashPayments(totalNonCash);
        setTotalExpenses(totalExp);
        setDenominationTotal(denomTotal);
        setDiscrepancy(discrep);
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
                monthlyNYearlySummary(data);
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
                // console.table(data);
                setSelectedMonthData(data);
                monthlyNYearlySummary(data);
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
                const {
                    expenses, 
                    soldItems, 
                    cashDenominations,
                    
                    grossSales,
                    totalExpenses,
                    cashPayments,
                    nonCashPayments,
                    cashDenominationsTotal,
                    discrepancy,
                } = response?.results;

                const nSoldItems = mergeResemblance(soldItems);

                setExpensesToShow(expenses);
                setSoldItemsToShow(nSoldItems);

                setGrossSales(grossSales);
                setTotalExpenses(totalExpenses);
                setNetCash(cashPayments);
                setTotalNonCashPayments(nonCashPayments);
                setDenominationTotal(cashDenominationsTotal);
                setDiscrepancy(discrepancy);

                transferCashDenominations(cashDenominations);
            }
        } catch (error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
            setSelectedDate(value);
        }
    }

    useLayoutEffect(() => {
        if (selectedPeriod) {
            setGrossSales(0);
            setTotalExpenses(0);
            setNetCash(0);
            setDenominationTotal(0);
            setDiscrepancy(0);
            setTotalNonCashPayments(0);
            setSelectedMonthData([]);
            setSelectedYearData([]);
        }
    }, [selectedPeriod]);

    useLayoutEffect(() => {
        selectDate(formattedDate(today));
    }, []);

    const PrinterButton = ({className}) => (
        <button
            onClick={handleCaptureHTMLAndPrintPDF}
            className={`flex gap-2 items-center justify-center leading-none bg-green-600 text-white font-bold rounded-lg p-2 sm:px-4 hover:bg-green-800 ${className}`}
        >
            <Printer />
            <span className="hidden sm:flex text-nowrap">Print</span>
        </button>
    );

    if (loading) {
        return (
            <Loading customStyle="w-full h-screen" />
        )
    }

    return (
        <main className="absolute top-0 
            left-admin-sidebar-sm lg:left-admin-sidebar-lg 
            w-[calc(100vw-var(--admin-sidebar-width-sm))] lg:w-[calc(100vw-var(--admin-sidebar-width-lg))] 
            h-screen bg-neutral-100 p-2 sm:p-4 lg:px-6
            flex flex-col"
        >
            <section className="flex justify-between">
                <h1 className="text-xl font-bold">Business Report</h1>
                <PrinterButton className="flex md:hidden" />
            </section>
            <section className="grow w-full h-full relative">
                <div className="w-full absolute top-0 left-0 right-0 bottom-0 mt-2 pb-10">
                    <div className="flex py-1  px-2 rounded-lg bg-white mb-2 mr-1">
                        <div 
                            className="w-full h-full flex
                                flex-wrap md:items-center md:gap-2">
                            <Select
                                name={`${selectedPeriod || 'Select Period'}`}
                                className="w-fit py-2 max-h-[40px] rounded-lg border-2 border-neutral-400 z-50"
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
                                            className="w-fit py-2 max-h-[40px] rounded-lg border-2 border-neutral-400 z-30"
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
                                            className="w-fit py-2 max-h-[40px] rounded-lg border-2 border-neutral-400 z-10"
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
                        <PrinterButton className="hidden md:flex"/>
                    </div>
                    <div className="w-full h-full
                        pr-1 flex sm:block pb-20
                        overflow-auto
                        [&::-webkit-scrollbar]:h-1
                        [&::-webkit-scrollbar]:w-1
                        [&::-webkit-scrollbar-track]:rounded-lg
                        [&::-webkit-scrollbar-track]:bg-gray-400/70
                        [&::-webkit-scrollbar-thumb]:rounded-lg
                        [&::-webkit-scrollbar-thumb]:bg-gray-300
                    ">
                        <div ref={componentRef} className="sm:w-full">
                            {selectedPeriod === 'Daily' ?
                                <>
                                    {/* Cash Breakdown */}
                                    {denominationTotal > 0 && (
                                        <div className="bg-white p-4 shadow-md rounded-lg mb-2">
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
                                                    {Object.entries(wordToNumberDenomination).map((item, index) => {
                                                        const [key, currency] = item;
                                                        const pieces = cashDenominations?.pieces[key];
                                                        if(pieces===0) return null;
                                                        return (
                                                            <tr key={index}>
                                                                <td className="border px-4 py-2">{currency}</td>
                                                                <td className="border px-4 py-2">{pieces}</td>
                                                                <td className="border px-4 py-2 ">
                                                                    {formattedCurrency(cashDenominations?.totals[key])}
                                                                </td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Sales Summary */}
                                    {grossSales > 0 && (
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
                                                            <td className="border px-4 py-2 ">{formattedCurrency(item?.totalAmount)}</td>
                                                            <td className="border px-4 py-2">{item?.paymentMethod}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Expense Summary */}
                                    {totalExpenses > 0 && (
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
                                    )}
                                </>
                                :
                                selectedPeriod === 'Monthly' && selectedMonthData?.length > 0 ?
                                    <>
                                        <div className="bg-white p-4 shadow-md rounded-lg mb-2">
                                            <h2 className="text-lg font-semibold mb-4">{selectedMonth} {selectedYear} Sales Summary</h2>
                                            <table className="w-full border-collapse border border-gray-200">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        <th className="border px-4 py-2 text-sm">
                                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        </th>
                                                        <th className="border px-4 py-2">Gross Sales</th>
                                                        <th className="border px-4 py-2">Total Expenses</th>
                                                        <th className="border px-4 py-2">Cash</th>
                                                        <th className="border px-4 py-2">Non-Cash</th>
                                                        <th className="border px-4 py-2">Cash Denominations Total</th>
                                                        <th className="border px-4 py-2">Discrepancy</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedMonthData?.map((item, index) => {
                                                        const discrepancy = item?.discrepancy;
                                                        return (
                                                            <tr key={index} className={`${discrepancy < 0 ? 'bg-red-100' : discrepancy > 0 ? 'bg-green-100' : ''}`}>
                                                                <td className="border px-4 text-center bg-transparent">{formattedDate(new Date(item?.date))}</td>
                                                                <td className="border px-4 py-2 bg-transparent">{formattedCurrency(item?.grossSales)}</td>
                                                                <td className="border px-4 py-2 bg-transparent">{formattedCurrency(item?.totalExpenses)}</td>
                                                                <td className="border px-4 py-2 bg-transparent">{formattedCurrency(item?.cashPayments)}</td>
                                                                <td className="border px-4 py-2 bg-transparent">{formattedCurrency(item?.nonCashPayments)}</td>
                                                                <td className="border px-4 py-2 bg-transparent">{formattedCurrency(item?.cashDenominationsTotal)}</td>
                                                                <td className="border px-4 py-2 bg-transparent">{formattedCurrency(discrepancy)}</td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                    :
                                    (selectedPeriod === 'Yearly' && selectedYearData?.length > 0) &&
                                    <>
                                        <div className="bg-white p-4 shadow-md rounded-lg mb-2">
                                            <h2 className="text-lg font-semibold mb-4">Sales Summary for Year {selectedYear}</h2>
                                            <table className="w-full border-collapse border border-gray-200">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        <th className="border px-4 py-2 text-sm">Month</th>
                                                        <th className="border px-4 py-2 text-sm">Gross Sales</th>
                                                        <th className="border px-4 py-2 text-sm">Total Expenses</th>
                                                        <th className="border px-4 py-2 text-sm">Cash</th>
                                                        <th className="border px-4 py-2 text-sm">Non-Cash</th>
                                                        <th className="border px-4 py-2 text-sm">Cash Denominations Total</th>
                                                        <th className="border px-4 py-2 text-sm">Discrepancy</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedYearData?.map((item, index) => {
                                                        const discrepancy = item?.discrepancy;
                                                        return (
                                                            <tr key={index} className={`${discrepancy < 0 ? 'bg-red-100' : discrepancy > 0 ? 'bg-green-100' : ''}`}>
                                                                <td className="border px-4 text-center text-sm">{item?.month}</td>
                                                                <td className="border px-4 py-2 bg-transparent">{formattedCurrency(item?.grossSales)}</td>
                                                                <td className="border px-4 py-2 bg-transparent">{formattedCurrency(item?.totalExpenses)}</td>
                                                                <td className="border px-4 py-2 bg-transparent">{formattedCurrency(item?.cashPayments)}</td>
                                                                <td className="border px-4 py-2 bg-transparent">{formattedCurrency(item?.nonCashPayments)}</td>
                                                                <td className="border px-4 py-2 bg-transparent">{formattedCurrency(item?.cashDenominationsTotal)}</td>
                                                                <td className="border px-4 py-2 bg-transparent">{formattedCurrency(discrepancy)}</td>
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
                                <p>Gross Sales:&nbsp;&nbsp;&nbsp;{formattedCurrency(grossSales)}</p>
                                <p>Total Expenses:&nbsp;&nbsp;&nbsp;{formattedCurrency(totalExpenses)}</p>
                                <p className="font-bold">
                                    Net Cash Available:&nbsp;&nbsp;&nbsp;{formattedCurrency(netCash)}
                                </p>
                                <p className="font-bold">
                                    Total Cash Denominations:&nbsp;&nbsp;&nbsp;{formattedCurrency(denominationTotal)}
                                </p>
                                <p className={`font-bold ${discrepancy<0 ? 'text-red-600' : 'text-black'}`}>
                                    Discrepancy:&nbsp;&nbsp;&nbsp;{formattedCurrency(discrepancy)}
                                </p>
                                <p className="font-bold">
                                    Total Non-Cash Payments:&nbsp;&nbsp;&nbsp;{formattedCurrency(totalNonCashPayments)}
                                </p>
                                <hr/>
                                <p className="font-bold text-lg pt-2">
                                    Total Collections:&nbsp;&nbsp;&nbsp;{formattedCurrency(netCash + totalNonCashPayments)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Report;
