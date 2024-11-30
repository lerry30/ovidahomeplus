import { breadcrumbsOrder as localStorageName } from '@/constants/localStorageNames';
import { useState, useLayoutEffect } from 'react';
import { zCustomerInfo } from '@/store/customerInfo';
import { zCashierSelectedItem } from '@/store/cashierSelectedItem';
import { useNavigate } from 'react-router-dom';
import { getData, sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { toNumber, formattedNumber } from '@/utils/number';

import SidebarLayout from '@/components/Sidebar';
import Breadcrumbs from '@/components/Breadcrumbs';
import Loading from '@/components/Loading';

const Checkout = () => {
    const currentFirstname = zCustomerInfo(state => state?.firstname);
    const currentLastname = zCustomerInfo(state => state?.lastname);
    const currentAddress = zCustomerInfo(state => state?.address);
    const currentContacts = zCustomerInfo(state => state?.contacts);

    const [items, setItems] = useState([]); // from database
    const [selectedItems, setSelectedItems] = useState([]);
    const [itemDetails, setItemDetails] = useState({});
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // to reset the UI
    const setSelectedToDisplay = () => {
        const selected = zCashierSelectedItem.getState()?.items || {};
        const selectedData = [];
        // I just get the items details in database to avoid setting it all in localstorage
        for(const item of items) {
            if(selected.hasOwnProperty(item?.id)) {
                selectedData.push(item);
            }
        }
        setSelectedItems(selectedData);
    }

    const getItems = async () => {
        try {
            setLoading(true);
            const response = await getData(urls?.getitems);
            if (response) {      
                const data = response?.results;
                // console.log(data);
                const fData = [];
                for(const item of data) {
                    if(!item?.disabledNote && item?.quantity > 0) {
                        fData.push(item);
                    }
                }
                setItems(fData);
            }
        } catch (error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        setSelectedToDisplay();
    }, [items]);

    useLayoutEffect(() => {
        zCustomerInfo.getState()?.reloadCustomerData();
        zCashierSelectedItem.getState()?.reloadSelectedItemData();

        const selected = zCashierSelectedItem.getState()?.items || [];
        setItemDetails({...selected});
        getItems();
    }, []);

    if (loading) {
        return (
            <Loading customStyle="w-full h-screen" />
        )
    }

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
                <section className="grow w-full h-full
                    flex flex-col lg:flex-row gap-4 pb-[200px]
                    overflow-x-hidden overflow-y-auto
                    [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:rounded-full
                    [&::-webkit-scrollbar-track]:bg-gray-100
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-gray-300
                    dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                    dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
                    <div className="w-full md:w-1/2 h-fit p-8 pb-12  
                        bg-white shadow-md rounded-lg overflow-hidden">
                        <article>
                            <h1 className="font-semibold">Customer Info</h1>
                            <article className="pt-2 md:pl-2">
                                <h2>{currentFirstname} {currentLastname}</h2>
                                <address>
                                    <p className="italic text-neutral-600">{currentAddress}</p>
                                    <a 
                                        href={`tel:+63 ${currentContacts.first?.substring(1)}`}
                                        className="not-italic"
                                    >
                                        +63 {currentContacts.first?.substring(1)}
                                    </a>
                                    {currentContacts?.second && (
                                        <a 
                                            href={`tel:+63 ${currentContacts.second?.substring(1)}`}
                                            className="not-italic"
                                        >
                                            +63 {currentContacts.second?.substring(1)}
                                        </a>
                                    )}
                                </address>
                            </article>
                        </article>
                    </div>
                    <div className="w-full md:w-1/2 h-fit p-8   pb-12 
                        bg-white shadow-md rounded-lg overflow-hidden">
                        <article>
                            <h1 className="font-semibold">Customer Info</h1>
                            <ul>
                            {
                                selectedItems?.length > 0 &&
                                    selectedItems.map((item, index) => (
                                        <li 
                                            key={index}
                                            className="w-full flex justify-center items-center px-4 py-1"
                                        >
                                            <h3 className="text-nowrap font-semibold">{item?.productTypeName}</h3>
                                            <div className="w-full border-t border-neutral-500 border-dashed mx-2 mt-1"></div>
                                            <h3 className="text-nowrap">
                                                ₱ {formattedNumber(itemDetails[item?.id]?.isDiscounted ? 
                                                    toNumber(item?.maxDiscount) * toNumber(itemDetails[item?.id]?.quantity)
                                                :
                                                    toNumber(item?.srp) * toNumber(itemDetails[item?.id]?.quantity)
                                                )}
                                            </h3>
                                        </li>
                                    ))
                            }
                            </ul>
                        </article>
                    </div>
                </section>
                <section className="w-full min-h-[200px] p-12
                    fixed bottom-0 right-0
                    left-admin-sidebar-sm lg:left-admin-sidebar-lg 
                    bg-white overflow-hidden">
                    <div></div>
                </section>
            </main>
        </div>
    )
}

export default Checkout;