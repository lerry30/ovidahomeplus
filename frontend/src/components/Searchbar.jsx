import { Search } from 'lucide-react';
import { forwardRef } from 'react';

const Searchbar = forwardRef(({search}, ref) => {
    return (
        <div className="w-full max-w-[500px] h-[38px] rounded-lg border border-neutral-700 overflow-hidden pl-4 pr-2">
            <div className="h-full flex flex-row items-center">
                <input ref={ref} onChange={search} className="w-full h-full outline-none bg-transparent leading-none" placeholder="Search"/>
                <Search size={26} color="#808080" />
            </div>
        </div>
    )
});

export default Searchbar;