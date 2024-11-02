import Searchbar from '@/components/Searchbar';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Supplier = () => {
    return (
        <div className="absolute top-0 left-admin-sidebar w-[calc(100vw-var(--admin-sidebar-width))] min-h-screen bg-neutral-100 py-4 px-10">
            <section className="flex justify-between items-center">
                <h1 className="font-semibold text-lg">Supplier</h1>
                <Searchbar />
                <Link
                    to="/admin/new-supplier"
                    className="flex gap-2 items-center justify-center leading-none bg-green-600 text-white font-bold rounded-full p-2 pr-4 hover:bg-green-800"
                >
                    <Plus />
                    New Supplier
                </Link>
            </section>
            <div className="w-full h-screen flex justify-center items-center">
                <h1 className="text-3xl font-bold">Supplier</h1>
            </div>
        </div>
    );
}

export default Supplier;