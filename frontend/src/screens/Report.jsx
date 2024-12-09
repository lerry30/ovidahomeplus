import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLayoutEffect, useState, useRef } from 'react';
import { sendJSON, getData } from '@/utils/send';
import { urls } from '@/constants/urls';
import { formattedDate } from '@/utils/datetime';
import { toNumber, formattedNumber } from '@/utils/number';

import Select from '@/components/DropDown';
import CalendarPicker from '@/components/CalendarPicker';
import Loading from '@/components/Loading';

const Report = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('Daily');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().getTime());
    const [soldItemsToShow, setSoldItemsToShow] = useState([]);
    const [expensesToShow, setExpensesToShow] = useState([]);
    const [totalCollection, setTotalCollection] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [netCash, setNetCash] = useState(0);
    const [loading, setLoading] = useState(false);

    const months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'November', 'December'];

    const mergeResemblance = (items) => {
        const itemKeys = {};
        for(const item of items) {
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
            if(itemKeys[nKey]) {
                itemObject.quantity++;
                itemObject.totalAmount = itemObject.totalAmount + itemKeys[nKey].totalAmount;
            }
            itemKeys[nKey] = itemObject;
        }
        return Object.values(itemKeys);
    }

    const selectMonth = (month) => {
        try {
            setLoading(true);
            setSelectedMonth(month);
        } catch(error) {
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
                const {expenses, soldItems} = response?.results;

                let totalExp = 0;
                for(const expense of expenses) {
                    totalExp = totalExp + toNumber(expense?.amount);
                }

                const nSoldItems = mergeResemblance(soldItems);     
                let totalColl = 0;
                for(const soldItem of nSoldItems) {
                    totalColl = totalColl + soldItem?.totalAmount;
                }

                setExpensesToShow(expenses);
                setSoldItemsToShow(nSoldItems);
                setTotalExpenses(totalExp);
                setTotalCollection(totalColl);
            }
        } catch(error) {
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
                for(const soldItem of nData) {
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
            if(response) {
                // console.log(response);
                const data = response?.results;
                let total = 0;
                for(const expense of data) {
                    total = total + toNumber(expense?.amount);
                }

                setExpensesToShow(data);
                setTotalExpenses(total);
            }
        } catch(error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        if(totalExpenses && totalCollection) {
            const net = totalCollection-totalExpenses;
            if(net > 0) setNetCash(net);
        }
    }, [totalExpenses, totalCollection]);

    useLayoutEffect(() => {
        if(selectedPeriod) {
            if(selectedPeriod.toLowerCase()==='monthly') {
                
            }
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
                    <div className="flex items-center py-1 space-x-2 px-2 rounded-lg bg-white mb-2 mr-1">
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
                        {selectedPeriod==='Daily' ?
                            <CalendarPicker callback={selectDate} selectedDate={selectedDate}/>
                        :
                            selectedPeriod==='Monthly' ?
                                <Select
                                    name={`${selectedMonth || 'Select Month'}`}
                                    className="w-fit py-2 max-h-[40px] rounded-lg border-2 border-neutral-400 z-20"
                                >
                                    {months?.map((month, index) => (
                                        <button 
                                            key={index}
                                            onClick={() => selectMonth(month)}
                                            className="text-nowrap text-[16px] p-2 px-4 rounded-lg hover:bg-gray-200 overflow-x-hidden text-ellipsis flex gap-2 items-center">
                                            {month}
                                        </button>
                                    ))}  
                                </Select>
                            :
                                <></>
                        }
                    </div>
                    <div className="w-full h-full
                        overflow-x-hidden pb-32 pr-1
                        overflow-y-auto
                        [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-track]:rounded-lg
                        [&::-webkit-scrollbar-track]:bg-gray-100
                        [&::-webkit-scrollbar-thumb]:rounded-lg
                        [&::-webkit-scrollbar-thumb]:bg-gray-300
                    ">
                        {/* Cash Breakdown */}
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
                                    <tr>
                                        <td className="border px-4 py-2">₱1,000</td>
                                        <td className="border px-4 py-2">51</td>
                                        <td className="border px-4 py-2">₱51,000</td>
                                    </tr>
                                    {/* Add rows dynamically */}
                                </tbody>
                            </table>
                        </div>

                        {/* Sales Summary */}
                        <div className="bg-white p-4 shadow-md rounded-lg mb-2">
                            <h2 className="text-lg font-semibold mb-4">Sales Summary</h2>
                            <table className="w-full border-collapse border border-gray-200">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border px-4 py-2">Supplier</th>
                                        <th className="border px-4 py-2">Item Name</th>
                                        <th className="border px-4 py-2">Qty</th>
                                        <th className="border px-4 py-2">Sold Date</th>
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
                                            <td className="border pxpy-2">{formattedDate(new Date(item?.soldAt))}</td>
                                            <td className="border px-4 py-2">₱ {formattedNumber(item?.totalAmount)}</td>
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
                                        {item?.type}:&nbsp;&nbsp;&nbsp;₱ {formattedNumber(item?.amount)}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Net Summary */}
                        <div className="bg-white p-4 shadow-md rounded-lg">
                            <h2 className="text-lg font-semibold">Net Summary</h2>
                            <p>Total Collection: ₱ {formattedNumber(totalCollection)}</p>
                            <p>Total Expenses: ₱ {formattedNumber(totalExpenses)}</p>
                            <p className="font-bold">Net Cash Available: ₱ {formattedNumber(netCash)}</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Report;
