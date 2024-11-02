import { NavLink, Outlet } from 'react-router-dom';
import AppLogo from '@/components/AppLogo';

const SidebarLayout = () => {
    return (
        <div className="fixed w-admin-sidebar h-screen flex flex-col py-4 pl-4 gap-4">
            <AppLogo />
            <NavLink to="/admin" end style={state => state?.isActive ? {backgroundColor: 'green', color: 'white'} : {}}
                className="rounded-l-full px-4 py-2 leading-none mt-2">
                    Dashboard
            </NavLink>
            <NavLink to="/admin/inventory" end style={state => state?.isActive ? {backgroundColor: 'green', color: 'white'} : {}} 
                className="rounded-l-full px-4 py-2 leading-none">
                    Inventory
            </NavLink>
            <NavLink to="/admin/test" end style={state => state?.isActive ? {backgroundColor: 'green', color: 'white'} : {}} 
                className="rounded-l-full px-4 py-2 leading-none">
                    Test
            </NavLink>
            <Outlet />
        </div>
    );
}

export default SidebarLayout;