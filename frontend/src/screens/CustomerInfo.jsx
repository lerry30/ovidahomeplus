import { breadcrumbsOrder as localStorageName, selectedItemsForCashier } from '@/constants/localStorageNames';
import { useState, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import SidebarLayout from '@/components/Sidebar';
import Breadcrumbs from '@/components/Breadcrumbs';

const CustomerInfo = () => {

    const navigate = useNavigate();
    
    useLayoutEffect(() => {

        // verify
        const selectedItems = JSON.parse(localStorage.getItem(selectedItemsForCashier) || '{}');
        if(Object.keys(selectedItems).length === 0) navigate('/admin/cashier');
    }, []);

    return (
        <div className="w-full min-h-screen">
            <SidebarLayout />
            <main className="absolute top-0 
                left-admin-sidebar-sm lg:left-admin-sidebar-lg 
                w-[calc(100vw-var(--admin-sidebar-width-sm))] lg:w-[calc(100vw-var(--admin-sidebar-width-lg))]
                h-full md:h-screen bg-neutral-100 p-4
                flex flex-col
                overflow-hidden
            ">
                {/* the height has fixed value to properly compute the remaining space available of screen */}
                <section className="w-full h-[30px] flex items-center gap-4">
                    {/* <h1 className="text-nowrap font-semibold text-lg">Order Details</h1> */}
                    <div className="">
                        <Breadcrumbs
                            tabNames={['Purchase Items', 'Customer Info', 'Checkout']}
                            tabLinks={['/admin/cashier', '/admin/customer-info', '/admin/checkout']}
                            localStorageName={localStorageName}
                        />
                    </div>
                </section>
                <section className="grow w-full h-full flex flex-col md:flex-row gap-4 bg-white rounded-lg">

                </section>
            </main>
        </div>
    )
}

export default CustomerInfo;