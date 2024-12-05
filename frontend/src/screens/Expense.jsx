import { CalendarSearch, Plus } from 'lucide-react';
import { useState, useRef } from 'react';

const Expense = () => {
    const [selectedDate, setSelectedDate] = useState('');
    const [loading, setLoading] = useState(false);

    const calendarInputRef = useRef(null);
    const today = new Date();

    const selectDate = async (ev) => {
        try {
            const input = ev.target.value;
            setSelectedDate(input);

            setLoading(true);
            const payload = { date: input };
            // const response = await sendJSON(urls.dateofsolditems, payload);
            // if (response) {
            //     const data = response?.results;
            //     setSoldItemsToShow(data);
            //     console.log(data);
            // }
        } catch (error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="absolute top-0 
            left-admin-sidebar-sm lg:left-admin-sidebar-lg 
            w-[calc(100vw-var(--admin-sidebar-width-sm))] lg:w-[calc(100vw-var(--admin-sidebar-width-lg))] 
            h-screen bg-neutral-100 sm:p-2 md:p-4 lg:px-6
            flex flex-col"
        >
            <section className="flex items-center gap-4">
                <h1 className="hidden sm:flex font-semibold text-lg">Expenses</h1>
                {/* <Searchbar ref={searchBar} search={() => {}} /> */}
            </section>
            <section>
                <h1 className="flex sm:hidden font-semibold text-lg">Expenses</h1>
            </section>
            <section className="grow w-full h-full relative flex flex-col overflow-hidden">
                <div className="flex justify-between items-center py-1 px-2 rounded-lg bg-white mb-2 mr-1">
                    <button 
                        onClick={() => {}}
                        className="flex space-x-2 p-2 bg-[#080] text-white rounded-lg shadow-sm"
                    >
                        <Plus />
                        <span className="hidden md:flex">Log New Expense</span>
                    </button>
                    <div className="flex items-center space-x-4 cursor-pointer">
                        <span className="font-semibold text-md">
                            {selectedDate ?
                                areDatesEqual(today, new Date(selectedDate)) ?
                                    'Today'
                                    :
                                    areDatesEqual(new Date(today.getTime() - 1000 * 60 * 60 * 24), new Date(selectedDate)) ?
                                        'Yesterday'
                                        :
                                        formattedDate(new Date(selectedDate))
                                :
                                'Today'
                            }
                        </span>
                        <div
                            onClick={() => calendarInputRef.current?.showPicker()}
                            className="flex items-center justify-center bg-gray-100 cursor-pointer"
                        >
                            <label className="relative block min-w-10">
                                <input
                                    type="date"
                                    ref={calendarInputRef}
                                    onChange={selectDate}
                                    className="absolute opacity-0 w-0 h-0"
                                />
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <CalendarSearch className="w-5 h-5 text-gray-400" />
                                </span>
                                <span className="hidden sm:block pl-10 pr-1 py-2 text-gray-700 border border-gray-300 rounded-lg shadow-sm">
                                    Choose a date
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
                <div className="
                    w-full h-full flex flex-col gap-2 pr-1
                    overflow-x-hidden overflow-y-auto
                    [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:rounded-full
                    [&::-webkit-scrollbar-track]:bg-gray-400/70
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-gray-300
                ">

                </div>
            </section>
        </main>
    )
}

export default Expense;
