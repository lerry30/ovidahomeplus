import { CalendarSearch } from 'lucide-react';
import { useState, useRef } from 'react';
import { areDatesEqual, formattedDate } from '@/utils/datetime';

const CalendarPicker = ({callback=(value)=>{}, selectedDate=''}) => {
    const calendarInputRef = useRef(null);
    const today = new Date();

    const selectDate = (ev) => {
        const input = ev.target.value;
        callback(input);
    }

    const openCalendar = () => {
        try {
            calendarInputRef.current?.showPicker();
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