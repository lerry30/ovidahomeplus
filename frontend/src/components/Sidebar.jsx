import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ListChecks, Truck, Package, UserRoundPen, Barcode, PackageCheck, HandCoins  } from 'lucide-react';
import AppLogo from '@/components/AppLogo';

const SidebarLayout = () => {
    return (
        <div className="fixed w-admin-sidebar-sm lg:w-admin-sidebar-lg h-screen flex flex-col py-4 pl-4 gap-4">
            <div className="hidden lg:flex">
                <AppLogo />
            </div>
            <NavLink to="/admin" end style={state => state?.isActive ? {backgroundColor: 'green', color: 'white'} : {}}
                className="flex items-center gap-4 rounded-lg px-4 py-2 leading-none mt-2">
                    <LayoutDashboard />
                    <span className="hidden lg:flex">Dashboard</span>
            </NavLink>
            <NavLink to="/admin/cashier" end style={state => state?.isActive ? {backgroundColor: 'green', color: 'white'} : {}}
                className="flex items-center gap-4 rounded-lg px-4 py-2 leading-none">
                    <UserRoundPen />
                    <span className="hidden lg:flex">Cashier</span>
            </NavLink>
            <NavLink to="/admin/expenses" end style={state => state?.isActive ? {backgroundColor: 'green', color: 'white'} : {}}
                className="flex items-center gap-4 rounded-lg px-4 py-2 leading-none">
                    <HandCoins  />
                    <span className="hidden lg:flex">Expense Overview</span>
            </NavLink>
            <NavLink to="/admin/sold-items" end style={state => state?.isActive ? {backgroundColor: 'green', color: 'white'} : {}}
                className="flex items-center gap-4 rounded-lg px-4 py-2 leading-none">
                    <PackageCheck />
                    <span className="hidden lg:flex">Sold Items</span>
            </NavLink>
            <NavLink to="/admin/barcodes" end style={state => state?.isActive ? {backgroundColor: 'green', color: 'white'} : {}}
                className="flex items-center gap-4 rounded-lg px-4 py-2 leading-none">
                    <Barcode />
                    <span className="hidden lg:flex">Barcodes</span>
            </NavLink>
            <NavLink to="/admin/inventory" end style={state => state?.isActive ? {backgroundColor: 'green', color: 'white'} : {}} 
                className="flex items-center gap-4 rounded-lg px-4 py-2 leading-none">
                    <ListChecks />
                    <span className="hidden lg:flex">Inventory</span>
            </NavLink>
            <NavLink to="/admin/product-types" end style={state => state?.isActive ? {backgroundColor: 'green', color: 'white'} : {}} 
                className="flex items-center gap-4 rounded-lg px-4 py-2 leading-none">
                    <Package />
                    <span className="hidden lg:flex">Product Types</span>
            </NavLink>
            <NavLink to="/admin/suppliers" end style={state => state?.isActive ? {backgroundColor: 'green', color: 'white'} : {}} 
                className="flex items-center gap-4 rounded-lg px-4 py-2 leading-none">
                    <Truck />
                    <span className="hidden lg:flex">Suppliers</span>
            </NavLink>
            <Outlet />
        </div>
    );
}

export default SidebarLayout;
