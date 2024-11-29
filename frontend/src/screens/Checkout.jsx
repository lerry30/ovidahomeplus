import { breadcrumbsOrder as localStorageName } from '@/constants/localStorageNames';

import SidebarLayout from '@/components/Sidebar';
import Breadcrumbs from '@/components/Breadcrumbs';

const Checkout = () => {
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
                <section className="grow w-full h-full flex flex-col gap-4 p-10 bg-white rounded-lg">
                    <h1>Checkout</h1>
                </section>
            </main>
        </div>
    )
}

export default Checkout;