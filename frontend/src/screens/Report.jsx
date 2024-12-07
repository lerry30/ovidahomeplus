import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';

import Select from '@/components/DropDown';
import CalendarPicker from '@/components/CalendarPicker';
import Loading from '@/components/Loading';

const Report = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('Daily');
    const [selectedDate, setSelectedDate] = useState(new Date().getTime());
    const [loading, setLoading] = useState(false);

    const selectDate = async (value) => {
        try {
            setLoading(true);
        } catch(error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
            setSelectedDate(value);
        }
    }
    
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
                        <CalendarPicker callback={selectDate} selectedDate={selectedDate}/>
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
                                    <tr>
                                        <td className="border px-4 py-2">LEELAND</td>
                                        <td className="border px-4 py-2">OFFICE TABLE 1.2M BG-298</td>
                                        <td className="border px-4 py-2">1</td>
                                        <td className="border px-4 py-2">11/29/2024</td>
                                        <td className="border px-4 py-2">₱10,000</td>
                                        <td className="border px-4 py-2">CASH</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Expense Summary */}
                        <div className="bg-white p-4 shadow-md rounded-lg mb-2">
                            <h2 className="text-lg font-semibold mb-4">Expense Summary</h2>
                            <ul className="list-disc list-inside">
                                <li>Notarize Ovida Document: ₱400</li>
                                <li>Ribbon Red-Bundle Promo: ₱166</li>
                                <li>Diesel Deliver Sir Fernan: ₱500</li>
                                {/* Add items dynamically */}
                            </ul>
                        </div>

                        {/* Net Summary */}
                        <div className="bg-white p-4 shadow-md rounded-lg">
                            <h2 className="text-lg font-semibold">Net Summary</h2>
                            <p>Total Collection: ₱79,830</p>
                            <p>Total Expenses: ₱8,466</p>
                            <p className="font-bold">Net Cash Available: ₱71,364</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Report;