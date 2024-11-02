import Searchbar from '@/components/Searchbar';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Inventory = () => {
    return (
        <div className="absolute top-0 left-admin-sidebar w-[calc(100vw-var(--admin-sidebar-width))] min-h-screen bg-neutral-100 p-4">
            <section className="flex justify-between items-center">
                <h1 className="font-semibold text-lg">Inventory</h1>
                <Searchbar />
                <Link
                    to="/admin/new-item"
                    className="flex gap-2 items-center justify-center leading-none bg-green-600 text-white font-bold rounded-full p-2 pr-4 hover:bg-green-800"
                >
                    <Plus />
                    New Item
                </Link>
            </section>
            <div className="w-full h-screen flex justify-center items-center">
                <h1 className="text-3xl font-bold">Inventory</h1>
            </div>
        </div>
    );
}

export default Inventory;