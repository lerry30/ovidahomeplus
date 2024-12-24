import { Banknote } from 'lucide-react';
import { breadcrumbsOrder as localStorageName, selectedItemsForCashier } from '@/constants/localStorageNames';
import { useState, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contactNumberInput } from '@/utils/contact';
import { zCustomerInfo } from '@/store/customerInfo';

import SidebarLayout from '@/components/Sidebar';
import Breadcrumbs from '@/components/Breadcrumbs';
import ErrorField from '@/components/ErrorField';
import TitleFormat from '@/utils/titleFormat';

const CustomerInfo = () => {
    const currentFirstname = zCustomerInfo(state => state?.firstname ?? '');
    const currentLastname = zCustomerInfo(state => state?.lastname ?? '');
    const currentAddress = zCustomerInfo(state => state?.address ?? '');
    const currentContacts = zCustomerInfo(state => state?.contacts ?? '');

    const [data, setData] = useState({firstname: currentFirstname, lastname: currentLastname, address: currentAddress});
    const [contacts, setContacts] = useState({first: currentContacts?.first, second: currentContacts?.second});
    const [errorData, setErrorData] = useState({firstname: '', lastname: '', address: '', contact: '', default: ''});

    const navigate = useNavigate();

    const saveCustomerInfo = () => {
        try {
            let hasError = false;

            if(!data?.firstname) {
                setErrorData(state => ({...state, firstname: 'Customer\'s first name is required.'}));
                hasError = true;
            }

            if(!data?.lastname) {
                setErrorData(state => ({...state, lastname: 'Customer\'s last name is required.'}));
                hasError = true;
            }

            if(!data?.address) {
                setErrorData(state => ({...state, address: 'Customer\'s address is required.'}));
                hasError = true;
            }

            if(!contacts?.first) {
                setErrorData(state => ({...state, contact: 'Customer\'s contact number is required.'}));
                hasError = true;
            }

            if(hasError) {
                throw new Error('Ensure all fields above are filled.');
            }

            zCustomerInfo
                .getState()
                ?.saveCustomerData(
                    TitleFormat(data?.firstname), 
                    TitleFormat(data?.lastname), 
                    TitleFormat(data?.address), 
                    contacts
                );
            navigate('/admin/payment');
        } catch(error) {
            console.log(error?.message);
            setErrorData(state => ({...state, default: error?.message}));
        }
    }

    const handleContactNumberInput = (input, nContact) => {
        const digits = contactNumberInput(input);
        setContacts(state => ({...state, [nContact]: digits}));
    }
    
    useLayoutEffect(() => {
        // verify
        const selectedItems = JSON.parse(localStorage.getItem(selectedItemsForCashier) || '{}');
        if(Object.keys(selectedItems).length === 0) navigate('/admin/cashier');

        zCustomerInfo.getState()?.reloadCustomerData();
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
                            tabNames={['Purchase Items', 'Customer Info', 'Payment', 'Checkout']}
                            tabLinks={['/admin/cashier', '/admin/customer-info', '/admin/payment', '/admin/checkout']}
                            localStorageName={localStorageName}
                        />
                    </div>
                </section>

                <header className="w-full">
                    <h1 className="text-2xl font-bold text-gray-800">Customer Info</h1>
                </header>

                <section 
                    className="grow w-full h-full flex flex-col gap-4 bg-white rounded-lg
                        py-4 md:py-10 md:px-10
                    ">
                    <div className="w-full flex flex-col md:flex-row gap-4 md:gap-0">
                        <div className="w-full md:w-1/2 flex flex-col px-4 gap-2">
                            <label htmlFor="firstname" className="font-semibold">
                                First Name
                                <span className="text-red-500">*</span>
                            </label>
                            <input 
                                id="firstname"
                                value={data?.firstname}
                                onChange={elem => {
                                    const input = elem.target.value;
                                    setData(state => ({...state, firstname: input}))
                                }}
                                className="w-full outline-none border-2 border-neutral-400 rounded-lg py-2 px-4" 
                                placeholder="First Name"
                                required
                            />
                            <ErrorField message={errorData?.firstname || ''} />
                        </div>
                        <div className="w-full md:w-1/2 flex flex-col px-4 gap-2">
                            <label htmlFor="lastname" className="font-semibold">
                                Last Name
                                <span className="text-red-500">*</span>
                            </label>
                            <input 
                                id="lastname"
                                value={data?.lastname}
                                onChange={elem => {
                                    const input = elem.target.value;
                                    setData(state => ({...state, lastname: input}));
                                }}
                                className="w-full outline-none border-2 border-neutral-400 rounded-lg py-2 px-4" 
                                placeholder="Last Name"
                                required
                            />
                            <ErrorField message={errorData?.lastname || ''} />
                        </div>
                    </div>
                    <div className="w-full flex flex-col px-4 gap-2">
                        <label htmlFor="address" className="font-semibold">
                            Address
                            <span className="text-red-500">*</span>
                        </label>
                        <input 
                            id="address"
                            value={data?.address}
                            onChange={elem => {
                                const input = elem.target.value;
                                setData(state => ({...state, address: input}))
                            }}
                            className="w-full outline-none border-2 border-neutral-400 rounded-lg py-2 px-4" 
                            placeholder="Address"
                            required
                        />
                        <ErrorField message={errorData?.address || ''} />
                    </div>
                    <div className="w-full flex flex-col md:flex-row gap-4 md:gap-0">
                        <div className="w-full md:w-1/2 flex flex-col px-4 gap-2">
                            <label htmlFor="first-contact-no" className="font-semibold">
                                1st Contact Number
                                <span className="text-red-500">*</span>
                            </label>
                            <input 
                                id="first-contact-no"
                                value={contacts?.first}
                                onChange={elem => {
                                    const input = elem.target.value?.trim();
                                    handleContactNumberInput(input, 'first');
                                }}
                                className="w-full outline-none border-2 border-neutral-400 rounded-lg py-2 px-4"
                                placeholder="09XX-XXX-XXXX"
                                required
                            />
                            <ErrorField message={errorData?.contact || ''} />
                        </div>
                        <div className="w-full md:w-1/2 flex flex-col px-4 gap-2">
                            <label htmlFor="second-contact-no" className="font-semibold">
                                2nd Contact Number
                            </label>
                            <input 
                                id="second-contact-no"
                                value={contacts?.second}
                                onChange={elem => {
                                    const input = elem.target.value?.trim();
                                    handleContactNumberInput(input, 'second');
                                }}
                                className="w-full outline-none border-2 border-neutral-400 rounded-lg py-2 px-4"
                                placeholder="09XX-XXX-XXXX (Optional)"
                                required
                            />
                        </div>
                    </div>
                    <div className="w-full flex justify-end py-6 sm:px-4">
                        <button
                            onClick={saveCustomerInfo}
                            className="flex items-center justify-center gap-2 leading-none bg-green-600 text-white font-bold rounded-lg p-3 hover:bg-green-800"
                        >
                            <Banknote />
                            <span className="hidden sm:flex text-nowrap">Proceed to Payment</span>
                        </button>
                    </div>
                    <ErrorField message={errorData?.default || ''} />
                </section>
            </main>
        </div>
    )
}

export default CustomerInfo;
