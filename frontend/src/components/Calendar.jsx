import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { daysOfMonths } from '@/utils/datetime';

const Calendar = ({year=2025, callback=(date)=>{}, highlight={}}) => {
    const [open, setOpen] = useState(false);
    const [month, setMonth] = useState(new Date().getMonth()); // months in zero based number
    const [rows, setRows] = useState(0);
    const [dayOffset, setDayOffset] = useState(0);

    const daysInWeeks = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];
    const noOfDaysInMonths = daysOfMonths(year);

    const handleClicked = (day) => {
        const date = `${month+1}-${day}-${year}`;
        callback(date);
        setOpen(false);
    }

    const jumpMonth = (moveNo) => {
        const nMonth = month + moveNo;
        if(nMonth < 0) return;
        setMonth(nMonth);
    }

    useEffect(() => {
        const noInAMonth = noOfDaysInMonths[month];
        const getStartOffset = new Date(`${month+1}-01-${year}`).getDay(); // mon=1 & sun=0, if day=wed=2. Since the format starts with sun therefore plus one to get the number from sun-tue as offset to compute rows in a month
        const noOfRows = Math.ceil((noInAMonth+getStartOffset)/7); // (31+2)/7 = Math.ceil(4.7) = 5 rows

        setRows(noOfRows);
        setDayOffset(getStartOffset);
    }, [month, year]);

    return (
        <div>
            <button onClick={() => setOpen(true)}>
                <CalendarIcon />
            </button>
            {open && (
                <div
                    className="absolute top-0 bottom-0 right-0 left-0
                        bg-neutral-100 flex justify-center items-center p-4" 
                    style={{zIndex: 51}}>
                    <main 
                        className="w-[600px] h-[500px] bg-white rounded-lg shadow-lg border
                            flex flex-col p-2">
                        <header className="flex justify-between p-2 pb-4">
                            <span
                                className="font-semibold">
                                {new Date(`${month+1}-01-${year}`)
                                    .toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}
                            </span>
                            <div className="flex">
                                <button onClick={() => jumpMonth(-1)}>
                                    <ChevronLeft />
                                </button>
                                <button onClick={() => jumpMonth(1)}>
                                    <ChevronRight />
                                </button>
                                <button
                                    className="ml-2"
                                    onClick={() => setOpen(false)}>
                                    <X />
                                </button>
                            </div>
                        </header>
                        <section className="w-full flex gap-1">
                            {daysInWeeks.map(day => (
                                <span key={day} className="w-full py-1 px-2 text-center text-sm">
                                    {day}
                                </span>
                            ))}
                        </section>
                        <section className="w-full h-full flex flex-col gap-1">
                            {Array(rows).fill(0).map((_, rowIndex) => {
                                return (
                                    <div 
                                        key={rowIndex}
                                        className="w-full h-full flex gap-1">
                                        {Array(7).fill(0).map((_, columnIndex) => {
                                            const linear = 7 * rowIndex + columnIndex;
                                            const columnNo = linear + 1;
                                            const maxNo = noOfDaysInMonths[month] + dayOffset;
                                            const day = columnNo > dayOffset && linear < maxNo ? columnNo-dayOffset : 0;
                                            
                                            const hlKey1 = `${month+1}-${day}-${year}`;
                                            const hlKey2 = `${String(month+1).padStart(2, 0)}-${String(day).padStart(2, 0)}-${year}`;
                                            const isHighlighted = highlight[hlKey1] || highlight[hlKey2];
                                            const highlightedValue = highlight[hlKey1] || highlight[hlKey2];
                                            return (
                                                <button
                                                    key={columnIndex}
                                                    onClick={() => handleClicked(day)}
                                                    className={`w-full h-full flex flex-col justify-between border p-2 
                                                        ${isHighlighted ? 'bg-green-200' : ''}`}>
                                                    {day!==0 && (
                                                        <span className="pl-1 text-sm">
                                                            {day}
                                                        </span>
                                                    )}
                                                    {isHighlighted && (
                                                        <span className="pl-1 text-sm">
                                                            {highlightedValue}
                                                        </span>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </section>
                    </main> 
                </div>
            )}
        </div>
    )
}

export default Calendar;
