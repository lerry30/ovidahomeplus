import { CalendarSearch } from 'lucide-react';
import { useRef } from 'react';
import { create } from 'zustand';
import { areDatesEqual, formattedDate } from '@/utils/datetime';
import { toNumber } from '@/utils/number';

const zCalendar = create(set => ({sameDate: false}));

const CalendarPicker = ({callback=(value)=>{}, selectedDate=''}) => {
    const calendarInputRef = useRef(null);
    const currentYear = useRef(0);
    const currentMonth = useRef(0);
    const currentDay = useRef(0);
    const today = new Date();

    const selectDate = (ev) => {
        const input = ev.target.value;
        const dateArray = input.split('-');
        if(dateArray?.length === 0) return;
        const year = toNumber(dateArray[0]);
        const month = toNumber(dateArray[1]);
        const day = toNumber(dateArray[2]);

        if((year !== currentYear.current ||
            month !== currentMonth.current) &&
            day === currentDay.current) {
            //!zCalendar.getState().sameDate) {
            //zCalendar.getState().sameDate = true;
            //console.log('--');
            return;
        }

        zCalendar.getState().sameDate = false;

        callback(input);
    }

    const openCalendar = () => {
        try {
            calendarInputRef.current?.showPicker();

            if(currentMonth===0||currentYear===0||currentDay===0) {
                currentMonth.current = today.getMonth()+1;
                currentYear.current = today.getFullYear();
                currentDay.current = today.getDate();
            }
        } catch(error) {}
    }

    return (
        <div className="flex items-center space-x-2 cursor-pointer">
            <div
                onClick={openCalendar}
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
        </div>
    )
}

export default CalendarPicker;
