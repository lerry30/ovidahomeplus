import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { toNumber, formattedNumber } from '@/utils/number';

const CashInput = ({ text, id, cash, data, setData }) => {
    const increase = () => setData(state => ({...state, [cash]: Math.max(0, toNumber(state[cash]) + 1)}));
    const decrease = () => setData(state => ({...state, [cash]: Math.max(0, toNumber(state[cash]) - 1)}));

    return (
        <div className="w-full flex flex-col">
            <label htmlFor={id} className="font-semibold">
                {text}
            </label>
            <div className="w-full flex space-x-2">
                <input 
                    id={id}
                    value={formattedNumber(data[cash])}
                    onChange={elem => {
                        const input = toNumber(elem.target.value);
                        setData(state => ({ ...state, [cash]: input }));
                    }}
                    className="w-full outline-none border-2 border-neutral-400 rounded-lg p-2" 
                    placeholder="0"
                />
                <button 
                    onClick={increase}
                    className="p-2 rounded-md bg-[#080] text-white">
                    <Plus />
                </button>
                <button 
                    onClick={decrease}
                    className="p-2 rounded-md bg-neutral-500 text-white">
                    <Minus />
                </button>
            </div>
        </div>
    );
}

export default CashInput;
