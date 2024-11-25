import { Routes, Route } from 'react-router-dom';

import Sidebar from '@/components/Sidebar';
import Dashboard from '@/screens/Dashboard';
import Inventory from '@/screens/Inventory';
import Supplier from '@/screens/Supplier';
import ProductTypes from '@/screens/ProductTypes';
import Cashier from '@/screens/Cashier';
import Barcode from '@/screens/Barcode';

const SidebarRoute = () => {
    return (
        <Routes>
            <Route element={<Sidebar />}>
                <Route index element={<Dashboard />} />
                <Route path="/cashier" element={<Cashier />}/>
                <Route path="/barcodes" element={<Barcode />}/>
                <Route path="/inventory" element={<Inventory />}/>
                <Route path="/product-types" element={<ProductTypes />} />
                <Route path="/suppliers" element={<Supplier />}/>
            </Route>
        </Routes>
    );
}

export default SidebarRoute;