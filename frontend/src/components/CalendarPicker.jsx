import { CalendarSearch } from 'lucide-react';
import { useRef, useCallback } from 'react';
import { create } from 'zustand';
import { areDatesEqual, formattedDate } from '@/utils/datetime';
import { toNumber } from '@/utils/number';

// Zustand store with proper typing and actions
const zCalendar = create((set) => ({
	sameDate: false,
    recurrentDate: '', // string for dates that same as before
	setSameDate: (value) => set({sameDate: value}),
	setRecurrentDate: (value) => set({recurrentDate: value}),
}));

const CalendarPicker = ({ callback = (value) => { }, selectedDate = '' }) => {
	const calendarInputRef = useRef(null);
	const lastValidDate = useRef({
		year: 0,
		month: 0,
		day: 0
	});
	const today = new Date();
	const setRecurrentDate = zCalendar(state => state.setRecurrentDate);

	const selectDate = useCallback((ev) => {
		const input = ev.target.value;
		if (!input) return;

		const dateArray = input.split('-');
		if (dateArray.length !== 3) return;

		const year = toNumber(dateArray[0]);
		const month = toNumber(dateArray[1]);
		const day = toNumber(dateArray[2]);

		// Only process if we have valid date components
		if (!year || !month || !day) return;
    

		// Check if user is just navigating months/years without selecting a day
		if (lastValidDate.current.day > 0 &&
			(year !== lastValidDate.current.year ||
				month !== lastValidDate.current.month) &&
			day === lastValidDate.current.day) {
            console.log(zCalendar.getState().recurrentDate !== input);
            if(zCalendar.getState().recurrentDate !== input) {
                setRecurrentDate(input);
                return;
            }
		}

		// Update last valid date
		lastValidDate.current = { year, month, day };
        //:setRecurrentDate('');
		callback(input);
	}, [callback, setRecurrentDate]);

	const openCalendar = useCallback(() => {
		try {
			calendarInputRef.current?.showPicker();

			// Initialize last valid date if not set
			if (lastValidDate.current.year === 0) {
				lastValidDate.current = {
					year: today.getFullYear(),
					month: today.getMonth() + 1,
					day: today.getDate()
				};
			}
		} catch (error) {}
	}, [today]);

	const getDisplayDate = () => {
		if (!selectedDate) return 'Today';

		const dateObj = new Date(selectedDate);
		if (areDatesEqual(today, dateObj)) return 'Today';

		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);
		if (areDatesEqual(yesterday, dateObj)) return 'Yesterday';

		return formattedDate(dateObj);
	};

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
				{getDisplayDate()}
			</span>
		</div>
	);
};

export default CalendarPicker;
