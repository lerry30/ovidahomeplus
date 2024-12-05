// import { Boxes } from 'lucide-react';
import { Prompt, ErrorModal } from '@/components/Modal';
import { breadcrumbsOrder, selectedItemsForCashier, customerInfo } from '@/constants/localStorageNames';
import { useState, useRef, useLayoutEffect } from 'react';
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
    const [selectedItems, setSelectedItems] = useState([]); // from local storage which is the customer order details or it is just info of the order
    const [itemDetails, setItemDetails] = useState({}); // defines the barcodes and if they are discounted
    const [total, setTotal] = useState(0);
    const [selectedPayment, setSelectedPayment] = useState(''); // radio button
    const [loading, setLoading] = useState(false);
    const [placeOrderPrompt, setPlaceOrderPrompt] = useState({header: '', message: ''});
    const [errorMessage, setErrorMessage] = useState({header: '', message: ''});

    const sending = useRef(false);
    const navigate = useNavigate();

    const finilizedOrder = async () => {
        try {
            setLoading(true);
            // to avoid multi submission
            if(!sending.current) {
                sending.current = true;

                if(!currentFirstname || !currentLastname || !currentAddress || !currentContacts?.first) {
                    setErrorMessage({
                        header: 'Customer Info',
                        message: 'Please provide the complete info of the customer.'
                    });
                    setTimeout(() => {
                        localStorage.setItem(breadcrumbsOrder, JSON.stringify([true, true, false]));
                        localStorage.removeItem(customerInfo);
                        navigate('/admin/customer-info');
                    }, 4000);
                    throw new Error('Please provide the complete info of the customer.');
                }

                if(Object.keys(itemDetails).length > 0) {
                    let error = false;
                    for(const key in itemDetails) {
                        const order = itemDetails[key];
                        error = order?.barcodes?.length===0;
                    }

                    if(error) {
                        setErrorMessage({
                            header: 'Error',
                            message: 'There\'s something wrong.'
                        });
                        setTimeout(() => {
                            localStorage.setItem(breadcrumbsOrder, JSON.stringify([true, false, false]));
                            localStorage.removeItem(selectedItemsForCashier);
                            localStorage.removeItem(customerInfo);
                            navigate('/admin/cashier');
                        }, 4000);
                        throw new Error('There\'s something wrong.');
                    }
                }

                const payload = {
                    customerInfo: {
                        firstname: currentFirstname,
                        lastname: currentLastname,
                        address: currentAddress,
                        contacts: {
                            first: String(currentContacts?.first).trim(),
                            second: String(currentContacts?.second).trim()
                        }
                    },
                    orders: itemDetails,
                    paymentMethod: selectedPayment
                }
                const response = await sendJSON(urls.neworder, payload);
                if(response) {
                    localStorage.removeItem(selectedItemsForCashier);
                    localStorage.removeItem(customerInfo);
                    navigate(0);
                }
            }
        } catch(error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
            sending.current = false;
            setPlaceOrderPrompt({header: '', message: ''});
        }
    }

    const handlePlacingOrder = ({header, message}) => {
        if(!selectedPayment) {
            setErrorMessage({
                header: 'Payment',
                message: 'Please select the customer\'s payment method first.'
            });
            return;
        }

        setPlaceOrderPrompt({header, message});
    }

    const handlePaymentChange = (method) => setSelectedPayment(method);

    const computeTotal = () => {
        const overAllTotal = selectedItems.reduce((t, item) => {
            const quantity = itemDetails[item?.id]?.barcodes?.length; 
            const isDiscounted = itemDetails[item?.id]?.isDiscounted;
            if (isDiscounted) return t + toNumber(item?.maxDiscount) * toNumber(quantity)
            return t + toNumber(item?.srp) * toNumber(quantity);
        }, 0);
        setTotal(overAllTotal);
    }

    const setSelectedToDisplay = () => {
        const selected = zCashierSelectedItem.getState()?.items || {};
        const selectedData = [];
        // I just get the items details in database to avoid setting it all in localstorage
        for (const item of items) {
            if (selected.hasOwnProperty(item?.id)) {
                selectedData.push(item);
            }
        }
        setSelectedItems(selectedData);
    }

    const getItems = async () => {
        try {
            setLoading(true);
            const response = await getData(urls.getexclude); // exclude sold items
            if (response) {
                const data = response?.results;
                // console.log(data);
                setItems(data);
            }
        } catch (error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        setTimeout(() => setErrorMessage({header: '', message: ''}), 7000);
    }, [errorMessage]);

    useLayoutEffect(computeTotal, [selectedItems]);
    useLayoutEffect(setSelectedToDisplay, [items]);

    useLayoutEffect(() => {
        // verify
        const selectedItems = JSON.parse(localStorage.getItem(selectedItemsForCashier) || '{}');
        const savedCustomerInfo = JSON.parse(localStorage.getItem(customerInfo) || '{}');
        if(Object.keys(selectedItems).length === 0 ||
            Object.keys(savedCustomerInfo).length === 0) 
            navigate('/admin/cashier');

        zCustomerInfo.getState()?.reloadCustomerData();
        zCashierSelectedItem.getState()?.reloadSelectedItemData();

        const selected = zCashierSelectedItem.getState()?.items;
        if(selected) setItemDetails({ ...selected });
        getItems();
    }, []);

    const PaymentOption = ({ name, description, children }) => {
        const isSelected = selectedPayment===name;
        return (
            <div 
                onClick={() => handlePaymentChange(name)}
                className={`flex-1 rounded-md p-4 border shadow-md hover:shadow-lg cursor-pointer flex flex-col gap-2
                    ${isSelected ? 'bg-green-600/10 border-green-500' : 'bg-white border-gray-300'}`}>
                <div className="flex items-center gap-2">
                    <input 
                        type="radio" 
                        name="payment" 
                        value={name}
                        checked={isSelected} 
                        onChange={() => handlePaymentChange(name)} 
                        className="w-5 h-5 accent-green-600" 
                    />
                    <h3 className="font-semibold text-gray-800">{name}</h3>
                </div>
                <p className="text-sm text-gray-500">{description}</p>
                {children}
            </div>
        )
    }

    if(placeOrderPrompt?.header || placeOrderPrompt?.message) {
        return (
            <Prompt 
                header={placeOrderPrompt?.header}
                message={placeOrderPrompt?.message} 
                callback={finilizedOrder} 
                onClose={() => setPlaceOrderPrompt({header: '', message: ''})} 
            />
        )
    }

    if(errorMessage?.header || errorMessage?.message) {
        return (
            <ErrorModal 
                header={errorMessage?.header}
                message={errorMessage?.message} 
                callback={() => setErrorMessage({header: '', message: ''})} 
            />
        )
    }

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
        h-full md:h-screen bg-neutral-100 p-4 flex flex-col overflow-hidden
    ">
                {/* Breadcrumbs Section */}
                <section className="w-full h-[30px] flex items-center gap-4">
                    <Breadcrumbs
                        tabNames={['Purchase Items', 'Customer Info', 'Checkout']}
                        tabLinks={['/admin/cashier', '/admin/customer-info', '/admin/checkout']}
                        localStorageName={breadcrumbsOrder}
                    />
                </section>

                {/* Main Content */}
                <section className="grow w-full flex flex-col lg:flex-row gap-4 overflow-hidden">
                    {/* Customer Info */}
                    <div className="w-full lg:w-1/2 p-8 bg-white shadow-md rounded-lg">
                        <h1 className="font-semibold text-lg">Customer Info</h1>
                        <article className="pt-4">
                            <h2 className="text-lg">{currentFirstname} {currentLastname}</h2>
                            <address className="text-sm text-neutral-600 flex flex-col gap-1">
                                <p className="italic">{currentAddress}</p>
                                {currentContacts?.first && (
                                    <a href={`tel:+63${currentContacts?.first?.substring(1)}`}>
                                        +63 {currentContacts?.first?.substring(1)}
                                    </a>
                                )}
                                {currentContacts?.second && (
                                    <a href={`tel:+63${currentContacts?.second?.substring(1)}`}>
                                        +63 {currentContacts?.second?.substring(1)}
                                    </a>
                                )}
                            </address>
                        </article>
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-1/2 p-8 bg-white shadow-md rounded-lg">
                        <h1 className="font-semibold text-lg">Order Summary</h1>
                        <ul className="max-h-[50%] mt-4
                            overflow-x-hidden overflow-y-auto pr-1
                            [&::-webkit-scrollbar]:w-2
                            [&::-webkit-scrollbar-track]:rounded-full
                            [&::-webkit-scrollbar-track]:bg-gray-100
                            [&::-webkit-scrollbar-thumb]:rounded-full
                            [&::-webkit-scrollbar-thumb]:bg-gray-300
                            ">
                            {selectedItems?.map((item, index) => (
                                <li key={index} className="flex justify-between items-center py-2">
                                    <span className="font-medium">{item.productTypeName}</span>
                                    <span className="text-right">
                                        ₱ {formattedNumber(
                                            itemDetails[item.id]?.isDiscounted
                                                ? toNumber(item.maxDiscount) * toNumber(itemDetails[item.id]?.barcodes?.length)
                                                : toNumber(item.srp) * toNumber(itemDetails[item.id]?.barcodes?.length)
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 flex justify-between items-center border-t pt-4">
                            <span className="font-semibold text-lg">Total</span>
                            <span className="font-semibold text-lg">
                                ₱ {formattedNumber(total)}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Footer Section */}
                <section
                    className="fixed bottom-0 left-admin-sidebar-sm lg:left-admin-sidebar-lg 
            w-[calc(100vw-var(--admin-sidebar-width-sm))] lg:w-[calc(100vw-var(--admin-sidebar-width-lg))]
            bg-gray-100 shadow-md border-t p-6"
                >
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                        {/* Payment Methods */}
                        <div className="flex flex-wrap gap-4 justify-center lg:justify-start w-full lg:w-auto">
                            <PaymentOption name="Bank Transfer" description="Customer paid via bank transfer." />
                            <PaymentOption name="Credit/Debit Card" description="Customer used a card to pay." />
                            <PaymentOption name="E-Wallet" description="Paid via e-wallet (GCash, Paymaya, Paypal)." />
                            <PaymentOption name="Cash Payment" description="Customer paid in cash." />
                        </div>

                        {/* Place Order Button */}
                        <button
                            onClick={() => handlePlacingOrder({header: 'Place Order', message: 'Are you sure you want to place this order?'})}
                            className="h-fit px-2 py-3 rounded-full bg-green-600 text-white font-semibold shadow-md hover:bg-green-700 hover:shadow-lg transition w-full lg:w-[19%]"
                        >
                            Place Order
                        </button>
                    </div>
                </section>
            </main>
        </div>

    )
}

export default Checkout;