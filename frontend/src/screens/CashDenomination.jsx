import { Pencil, X, Equal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLayoutEffect, useState } from 'react';
import { formattedCurrency, toNumber } from '@/utils/number';
import { areDatesEqual } from '@/utils/datetime';
import { getData, sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';

import CalendarPicker from '@/components/CalendarPicker';
import Loading from '@/components/Loading';

const CashDenomination = () => {
    const [data, setData] = useState({onethousand: 0, fivehundred: 0, twohundred: 0, onehundred: 0, fifty: 0, twenty: 0, ten: 0, five: 0, one: 0});
    const [totals, setTotals] = useState({onethousand: 0, fivehundred: 0, twohundred: 0, onehundred: 0, fifty: 0, twenty: 0, ten: 0, five: 0, one: 0});
    const [total, setTotal] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date().getTime());
    const [loading, setLoading] = useState(false);

    const wordToNumberDenomination = {onethousand: 1000, fivehundred: 500, twohundred: 200, onehundred: 100, fifty: 50, twenty: 20, ten: 10, five: 5, one: 1};
    const today = new Date();

    const transferData = (cashDenominations) => {
        const nDenominations = {};
        const nTotals = {};
        let nTotal = 0;
        for(const key in cashDenominations) {
            const denom = cashDenominations[key];
            const nKey = String(key).toLowerCase().trim();
            nDenominations[nKey] = denom;
            const eachDenomTotal = toNumber(denom) * wordToNumberDenomination[nKey];
            nTotals[nKey] = eachDenomTotal;
            nTotal = nTotal + eachDenomTotal;
        }
        setData({...nDenominations});
        setTotals({...nTotals});
        setTotal(nTotal);
    }

    const selectDate = async (value) => {
        try {
            setLoading(true);
            const payload = { date: value };
            const response = await sendJSON(urls.dateofcashdenominations, payload);
            if (response) {
                const data = response?.results;
                transferData(data);
            }
        } catch (error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
            setSelectedDate(value);
        }
    }

    const getTodaysCashDenominations = async () => {
        try {
            setLoading(true);

            const response = await getData(urls.cashdrawer);
            if(response) {
                const cashDenominations = response?.cashDenominations ?? {};
                transferData(cashDenominations);
            }
        } catch(error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        getTodaysCashDenominations();
    }, []);

    if(loading) {
        return (
            <Loading customStyle="w-full h-screen" />
        )
    }

    return (
        <main className="absolute top-0 
            left-admin-sidebar-sm lg:left-admin-sidebar-lg 
            w-[calc(100vw-var(--admin-sidebar-width-sm))] lg:w-[calc(100vw-var(--admin-sidebar-width-lg))]
            h-full md:h-screen bg-neutral-100 p-4
            flex flex-col
        ">
            <section className="flex items-center pr-2 pb-2">
                <h1 className="hidden sm:flex font-semibold text-lg text-nowrap">Cash Denominations</h1>

                {areDatesEqual(today, new Date(selectedDate)) && (
                    <div className="w-full flex justify-end">
                        <Link 
                            to="/admin/update-cash-drawer"
                            className="flex space-x-2 p-2 bg-[#080] text-white rounded-lg shadow-sm"
                        >
                            <Pencil />
                            <span className="hidden md:flex">Edit Cash Denominations</span>
                        </Link>
                    </div>
                )}
            </section>
            <section>
                <h1 className="flex sm:hidden font-semibold text-lg">Cash Denominations</h1>
            </section>
            <section className="grow w-full h-full relative flex flex-col overflow-hidden">
                <div className="flex justify-between items-center py-1 px-2 rounded-lg bg-white mb-2 mr-1">
                    <CalendarPicker callback={selectDate} selectedDate={selectedDate}/>
                    <article>
                        <span>Total: </span>
                        <span className="font-semibold">{formattedCurrency(total)}</span>
                    </article>
                </div>
                <div className="w-full h-full flex flex-col gap-2 bg-white p-4 rounded-lg
                    overflow-auto
                    [&::-webkit-scrollbar]:h-1
                    [&::-webkit-scrollbar]:w-1
                    [&::-webkit-scrollbar-track]:rounded-lg
                    [&::-webkit-scrollbar-track]:bg-gray-400/70
                    [&::-webkit-scrollbar-thumb]:rounded-lg
                    [&::-webkit-scrollbar-thumb]:bg-gray-300
                    ">
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
                                return (
                                    <tr key={index}>
                                        <td className="border px-4 py-2">{currency}</td>
                                        <td className="border px-4 py-2">{data[key]}</td>
                                        <td className="border px-4 py-2 text-nowrap">
                                            {formattedCurrency(totals[key])}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    )
}

export default CashDenomination;
