import { Plus, Ellipsis } from 'lucide-react';
import { Prompt } from '@/components/Modal';
import { Link, useNavigate } from 'react-router-dom';
import { useLayoutEffect, useState, useRef } from 'react';
import { getData, sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { zExpense } from '@/store/expense';
import { toNumber, formattedCurrency } from '@/utils/number';
import { areDatesEqual } from '@/utils/datetime';

import CalendarPicker from '@/components/CalendarPicker';
import Loading from '@/components/Loading';

const Expense = () => {
    const [expensesToShow, setExpensesToShow] = useState([]);
    const [total, setTotal] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date().getTime());
    const [expenseActions, setExpenseActions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [disablePrompt, setDisablePrompt] = useState(false);

    const actionId = useRef(null);

    const navigate = useNavigate();
    const today = new Date();

    const selectDate = async (value) => {
        try {
            setLoading(true);
            const payload = { date: value };
            const response = await sendJSON(urls.dateofexpenses, payload);
            if (response) {
                const data = response?.results;
                setExpensesToShow(data);
                // console.log(data);
            }
        } catch (error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
            setSelectedDate(value);
        }
    }

    const removeExpense = async () => {
        try {
            setLoading(true);
            const id = toNumber(actionId.current) ?? 0
            if(!id) throw new Error('The expense not found.');
            
            const payload = {id};
            const response = await sendJSON(urls.deleteexpense, payload, 'DELETE');
            if(response) {
                getExpensesToday();
            }
        } catch(error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
            setDisablePrompt(false);
        }
    }

    const showPromptRemove = (id) => {
        setDisablePrompt(true);
        actionId.current = id;
    }

    const updateExpense = ({id, type, amount}) => {
        zExpense.getState()?.saveExpenseData(id, type, amount);
        navigate('/admin/update-expense');
    }

    const openDropdown = (ev, index) => {
        ev.stopPropagation();
        setExpenseActions(state => state.map((_, i) => i===index));
    }

    const getExpensesToday = async () => {
        try {
            setLoading(true);
            const response = await getData(urls.getexpensestoday);
            if(response) {
                // console.log(response);
                const data = response?.results;
                setExpensesToShow(data);
            }
        } catch(error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        setExpenseActions(Array(expensesToShow?.length).fill(false));
        let nTotal = 0;
        for(const expense of expensesToShow) {
            const amount = toNumber(expense?.amount);
            nTotal = nTotal + amount;
        }
        setTotal(nTotal);
    }, [expensesToShow]);

    useLayoutEffect(() => {
        getExpensesToday();

        const closeActions = () => setExpenseActions(state => state.map(item => false));
        addEventListener('click', closeActions);
        return () => {
            removeEventListener('click', closeActions);
        }
    }, []);

    if(disablePrompt) {
        return (
            <Prompt 
                header="Confirm Expense Removal" 
                message="Are you sure you want to remove this expense? This action cannot be undone." 
                callback={removeExpense} 
                onClose={()=>setDisablePrompt(false)} 
            />
        )
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
            <section className="flex items-center pr-2 pb-2">
                <h1 className="hidden sm:flex font-semibold text-lg">Expenses</h1>
                {/* <Searchbar ref={searchBar} search={() => {}} /> */}
                {areDatesEqual(today, new Date(selectedDate)) && (
                    <div className="w-full flex justify-end">
                        <Link 
                            to="/admin/new-expense"
                            className="flex space-x-2 p-2 bg-[#080] text-white rounded-lg shadow-sm"
                        >
                            <Plus />
                            <span className="hidden md:flex">Log New Expense</span>
                        </Link>
                    </div>
                )}
            </section>
            <section>
                <h1 className="flex sm:hidden font-semibold text-lg">Expenses</h1>
            </section>
            <section className="grow w-full h-full relative flex flex-col overflow-hidden">
                <div className="flex justify-between items-center py-1 px-2 rounded-lg bg-white mb-2 mr-1">
                    <CalendarPicker callback={selectDate} selectedDate={selectedDate}/>
                    <article>
                        <span>Total: </span>
                        <span className="font-semibold">{formattedCurrency(total)}</span>
                    </article>
                </div>
                {expensesToShow?.length<=0 && (
                    <div className="absolute top-[60px] left-0 right-0 bottom-0 flex justify-center items-center">
                        <h3>No expenses were found for the selected date. Please choose a different date.</h3>
                    </div>
                )}
                <ul className="
                    w-full h-full flex flex-col gap-2 pr-1
                    overflow-x-hidden overflow-y-auto
                    [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:rounded-lg
                    [&::-webkit-scrollbar-track]:bg-gray-400/70
                    [&::-webkit-scrollbar-thumb]:rounded-lg
                    [&::-webkit-scrollbar-thumb]:bg-gray-300
                ">
                    {expensesToShow?.map((item, index) => (
                        <li
                            key={index} 
                            className="w-full flex bg-white shadow-lg rounded-xl border"
                        >
                            <article className="w-full flex justify-between p-3">
                                <span className="w-[30vw] sm:w-full overflow-hidden mr-2">{item?.type}</span>
                                <span className="text-nowrap">{formattedCurrency(String(item?.amount).split('.')[0])}</span>
                            </article>
                            <div className="flex justify-center items-center px-4">
                                <div className="relative size-[26px] rounded-lg hover:cursor-pointer hover:bg-gray-200">
                                    <button onClick={(ev) => openDropdown(ev, index)}
                                        className="z-0"
                                    >
                                        <Ellipsis />
                                    </button>
                                    <article className={`absolute right-0 z-10 text-sm bg-white rounded-lg border shadow-lg p-1 ${expenseActions[index]?'block':'hidden'}`}>
                                        <button
                                            onClick={() => showPromptRemove(item?.id)}
                                            className="w-full text-start hover:bg-gray-100 p-1 rounded-lg"
                                        >
                                            Remove
                                        </button>
                                        <button
                                            onClick={() => updateExpense(item)}
                                            className="w-full text-start hover:bg-gray-100 p-1 rounded-lg"
                                        >
                                            Update
                                        </button>
                                    </article>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    )
}

export default Expense;
