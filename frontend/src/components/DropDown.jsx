import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const Select = ({ children, className='', name='' }) => {
    const [ open, setOpen ] = useState(false);
    const dropdown = useRef(null);
    const dropdownArrow = useRef(null);

    const toggle = () => {
        setOpen(state => !state);
        dropdown.current.dataset.ui = dropdown.current.dataset.ui ? '' : 'active';
        dropdownArrow.current.dataset.ui = dropdownArrow.current.dataset.ui ? '' : 'active';
    }
    
    const focusOutside = (ev) => {
        if(!dropdown.current?.contains(ev.target)) {
            // just to specify specific element since every click 
            // triggers all instance of this dropdown event listener
            if(dropdown?.current?.dataset?.ui === 'active') {
                dropdown.current.dataset.ui = '';
                dropdownArrow.current.dataset.ui = '';
            }

            setOpen(false);
        }
    }
    
    useEffect(() => {
        addEventListener('click', focusOutside);
        return () => removeEventListener('click', focusOutside);
    }, []);

    return (
        <div ref={ dropdown } className={ `relative ${ className }`}>
            <button onClick={ toggle } className="min-w-28 pl-2 pr-1 flex items-center justify-between focus:outline-none">
                <span className="leading-4"> { name } </span>
                <span ref={ dropdownArrow } className="data-active:rotate-180 transition-transform">
                    <ChevronDown size="24" />
                </span>
            </button>
            <div className={ `absolute flex-col mt-1 p-2 border border-neutral-300 shadow-lg bg-white rounded-lg ${ open ? 'flex' : 'hidden' }` }>
                { children }
            </div>
        </div>
    );
}

export default Select;
