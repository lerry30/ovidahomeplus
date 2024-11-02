import { Routes, Route } from 'react-router-dom';

import Sidebar from '@/components/Sidebar';
import Dashboard from '@/screens/Dashboard';
import Inventory from '@/screens/Inventory';

const SidebarRoute = () => {
    return (
        <Routes>
            <Route element={<Sidebar />}>
                <Route index element={<Dashboard />} />
                <Route path="/inventory" element={<Inventory />}/>
                <Route path="/test" element={<p>test</p>}/>
            </Route>
        </Routes>
    );
}

export default SidebarRoute;