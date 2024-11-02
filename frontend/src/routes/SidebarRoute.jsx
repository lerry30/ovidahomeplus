import { Routes, Route } from 'react-router-dom';

import Sidebar from '@/components/Sidebar';
import Dashboard from '@/screens/Dashboard';
import Inventory from '@/screens/Inventory';
import Supplier from '@/screens/Supplier';

const SidebarRoute = () => {
    return (
        <Routes>
            <Route element={<Sidebar />}>
                <Route index element={<Dashboard />} />
                <Route path="/inventory" element={<Inventory />}/>
                <Route path="/supplier" element={<Supplier />}/>
            </Route>
        </Routes>
    );
}

export default SidebarRoute;