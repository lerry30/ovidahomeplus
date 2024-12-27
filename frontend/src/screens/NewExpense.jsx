import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toNumber } from '@/utils/number';
import { sendJSON } from '@/utils/send'; 
import { urls } from '@/constants/urls';

import SidebarLayout from '@/components/Sidebar';
import ErrorField from '@/components/ErrorField';
import Loading from '@/components/Loading';
import TitleFormat from '@/utils/titleFormat';
 
const NewExpense = () => {
    const [data, setData] = useState({expenseType: '', expenseAmount: 0});
    const [errorData, setErrorData] = useState({expenseType: '', expenseAmount: '', default: ''});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const expense = async () => {
        try {
            setLoading(true);
            setErrorData(({expenseType: '', expenseAmount: '', default: ''}));

            const expenseType = TitleFormat(String(data?.expenseType).trim());
            const expenseAmount = toNumber(data?.expenseAmount) ?? 0;

            let hasError = false;
            if(!expenseType) {
                setErrorData(state => ({...state, expenseType: 'Please include the expense type.'}));
                hasError = true;
            }

            if(expenseAmount <= 0) {
                setErrorData(state => ({...state, expenseAmount: 'Please specify the amount of the expense.'}));
                hasError = true;
            }

            if(hasError) throw new Error('Please provide the correct input for the expense.');

            const payload = {expenseType, expenseAmount};
            const response = await sendJSON(urls.newexpense, payload);
            if(response) {
                navigate('/admin/update-cash-drawer');
            }
        } catch(error) {
            console.log(error?.message);
            setErrorData(state => ({...state, default: error?.message}));
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <Loading customStyle="w-full h-screen" />
        )
    }

    return (
        <div className="w-full min-h-screen">
            <SidebarLayout />
            <main className="absolute top-0 
                left-admin-sidebar-sm lg:left-admin-sidebar-lg 
                w-[calc(100vw-var(--admin-sidebar-width-sm))] lg:w-[calc(100vw-var(--admin-sidebar-width-lg))]
                h-full md:h-screen bg-neutral-100 p-4
                flex flex-col
                overflow-hidden
            ">
                {/* the height has fixed value to properly compute the remaining space available of screen */}
                <section className="w-full h-[30px] flex items-center gap-4">
                    <h1 className="text-nowrap font-semibold text-lg">Add New Expense</h1>
                </section>
                <section className="grow w-full h-full flex flex-col gap-4 py-10 px-20 bg-white rounded-lg">
                    <div className="w-full flex flex-col sm:px-4 gap-2">
                        <label htmlFor="type-of-expense" className="font-semibold">
                            Type of Expense
                            <span className="text-red-500">*</span>
                        </label>
                        <input 
                            id="type-of-expense"
                            value={data?.expenseType}
                            onChange={elem => {
                                const input = elem.target.value;
                                setData(state => ({...state, expenseType: input}));
                            }}
                            className="w-full outline-none border-2 border-neutral-400 rounded-lg py-2 px-4" 
                            placeholder="Type of Expense"
                            required
                        />
                        <ErrorField message={errorData?.expenseType || ''} />
                    </div>
                    <div className="w-full flex flex-col sm:px-4 gap-2">
                        <label htmlFor="amount-of-expense" className="font-semibold">
                            Amount of Expense
                            <span className="text-red-500">*</span>
                        </label>
                        <input 
                            id="amount-of-expense"
                            value={data?.expenseAmount}
                            onChange={elem => {
                                const input = toNumber(elem.target.value);
                                setData(state => ({...state, expenseAmount: input}));
                            }}
                            className="w-full outline-none border-2 border-neutral-400 rounded-lg py-2 px-4" 
                            required
                        />
                        <ErrorField message={errorData?.expenseAmount || ''} />
                    </div>
                    <div className="w-full flex justify-end space-x-4 sm:px-4">
                        <Link 
                            to="/admin/expenses" 
                            className="flex items-center justify-center leading-none font-bold rounded-lg p-3 text-white bg-gray-500 hover:bg-gray-600"
                        >
                            Cancel
                        </Link>
                        <button
                            onClick={expense}
                            className="flex space-x-2 p-3 bg-[#080] text-white rounded-lg shadow-sm"
                        >
                            <Plus />
                            <span className="hidden sm:flex text-nowrap">Add Expense</span>
                        </button>
                    </div>
                    <span className="px-4">
                        <ErrorField message={errorData?.default || ''} />
                    </span>
                </section>
            </main>
        </div>
    )
}

export default NewExpense;
