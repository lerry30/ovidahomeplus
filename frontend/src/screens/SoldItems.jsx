import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLayoutEffect, useState, useRef } from 'react';
import { getData } from '@/utils/send';
import { urls } from '@/constants/urls';

import Searchbar from '@/components/Searchbar';
import Loading from '@/components/Loading';

const SoldItems = () => {
    const [today, setToday] = useState([]);
    const [loading, setLoading] = useState(false);

    const searchBar = useRef(null);
    const navigate = useNavigate();

    const getSoldItemsToday = async () => {
        try {
            setLoading(true);
            const response = await getData(urls.solditemstoday);
            if(response) {
                console.log(response);
            }
        } catch(error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        getSoldItemsToday();
    }, []);

    return (
        <main className="absolute top-0 
            left-admin-sidebar-sm lg:left-admin-sidebar-lg 
            w-[calc(100vw-var(--admin-sidebar-width-sm))] lg:w-[calc(100vw-var(--admin-sidebar-width-lg))] 
            min-h-screen bg-neutral-100 p-4 lg:px-6
            flex flex-col"
        >
            <section className="flex items-center gap-4">
                <h1 className="hidden sm:flex font-semibold text-lg">Sold Items</h1>
                {/* <Searchbar ref={searchBar} search={() => {}} /> */}
            </section>
            <section>
                <h1 className="flex sm:hidden font-semibold text-lg">Sold Items</h1>
            </section>
            <section>
                <h2 className="hidden sm:flex font-semibold text-lg">Today</h2>
            </section>
            <section className="grow w-full h-full relative">

            </section>
        </main>
    )
}

export default SoldItems;