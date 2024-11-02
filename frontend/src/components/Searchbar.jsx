import { Search } from 'lucide-react';

const Searchbar = () => {

    const search = (ev) => {
        ev.preventDefault();
        try {
            console.log('search');
        } catch(error) {
            console.log(error);
        } finally {

        }
    }

    return (
        <div className="w-full max-w-[500px] h-[38px] rounded-full border border-neutral-700 overflow-hidden pl-4 pr-2">
            <form onSubmit={search} className="h-full flex flex-row items-center">
                <input className="w-full h-full outline-none bg-transparent leading-none" placeholder="Search"/>
                <button type="submit">
                    <Search size={26} color="#808080" />
                </button>
            </form>
        </div>
    )
}

export default Searchbar;