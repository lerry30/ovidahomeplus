import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLayoutEffect, useState } from 'react';
import { getData } from '@/utils/send';
import { urls, apiUrl } from '@/constants/urls';

import Searchbar from '@/components/Searchbar';
import Loading from '@/components/Loading';

const Supplier = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);

    const getSuppliers = async () => {
        try {
            setLoading(true);

            const response = await getData(urls?.getsuppliers);
            if(response) {
                console.log(response?.result);
                const data = response?.result || [];
                setSuppliers(data);
            }
        } catch(error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        getSuppliers();
    }, []);

    if(loading) {
        return (
            <Loading customStyle="w-full h-screen" />
        )
    }

    return (
        <div className="absolute top-0 
            left-admin-sidebar-sm lg:left-admin-sidebar-lg 
            w-[calc(100vw-var(--admin-sidebar-width-sm))] lg:w-[calc(100vw-var(--admin-sidebar-width-lg))] 
            min-h-screen bg-neutral-100 p-4 lg:px-6
            flex flex-col"
        >
            <section className="flex justify-between items-center gap-4">
                <h1 className="hidden sm:flex font-semibold text-lg">Supplier</h1>
                <Searchbar />
                <Link
                    to="/admin/new-supplier"
                    className="flex gap-2 items-center justify-center leading-none bg-green-600 text-white font-bold rounded-full p-2 sm:pr-4 hover:bg-green-800"
                >
                    <Plus />
                    <span className="hidden sm:flex text-nowrap">New Supplier</span>
                </Link>
            </section>
            <h1 className="flex sm:hidden font-semibold text-lg">Supplier</h1>
            <div className="grow w-full h-full relative">
                <div className="w-full absolute top-0 left-0 right-0 bottom-0 bg-white mt-2 rounded-lg shadow-md">
                    {
                        suppliers?.length > 0 ? (
                            <ul>
                                {
                                    suppliers.map(item => (
                                        <li key={item?.id}>
                                            <img src={`${apiUrl}/suppliers/${item?.image}`} alt="ovida-supplier" />
                                        </li>
                                    ))
                                }
                            </ul>
                        ) : (
                            <div className="w-full h-screen flex justify-ceter items-center">
                                <h3>No Suppliers Found</h3>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
}

export default Supplier;