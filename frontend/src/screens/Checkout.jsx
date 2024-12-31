import { ShoppingBag, X } from 'lucide-react';
import { Prompt, ErrorModal } from '@/components/Modal';
import { breadcrumbsOrder, selectedItemsForCashier, customerInfo, payment } from '@/constants/localStorageNames';
import { useState, useRef, useLayoutEffect } from 'react';
import { zCustomerInfo } from '@/store/customerInfo';
import { zCashierSelectedItem } from '@/store/cashierSelectedItem';
import { zPayment } from '@/store/payment';
import { useNavigate } from 'react-router-dom';
import { getData, sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { toNumber, formattedNumber, formattedCurrency } from '@/utils/number';

import SidebarLayout from '@/components/Sidebar';
import Breadcrumbs from '@/components/Breadcrumbs';
import Loading from '@/components/Loading';

const Checkout = () => {
    const currentFirstname = zCustomerInfo(state => state?.firstname);
    const currentLastname = zCustomerInfo(state => state?.lastname);
    const currentAddress = zCustomerInfo(state => state?.address);
    const currentContacts = zCustomerInfo(state => state?.contacts);

    const currentPaymentMethod = zPayment(state => state?.paymentMethod);
    const currentDenominations = zPayment(state => state?.cash?.denominations);
    const currentTotalPayment = zPayment(state => state?.cash?.totalPayment);
    const currentCustomerChange = zPayment(state => state?.cash?.change);

    const [items, setItems] = useState([]); // from database
    const [selectedItems, setSelectedItems] = useState([]); // from local storage which is the customer order details or it is just info of the order
    const [itemDetails, setItemDetails] = useState({}); // defines the barcodes and if they are discounted
    const [total, setTotal] = useState(0);
    const [selectedPayment, setSelectedPayment] = useState('Cash Payment'); // radio button
    const [loading, setLoading] = useState(false);
    const [placeOrderPrompt, setPlaceOrderPrompt] = useState({header: '', message: ''});

    const wordToNumberDenomination = {onethousand: 1000, fivehundred: 500, twohundred: 200, onehundred: 100, fifty: 50, twenty: 20, ten: 10, five: 5, one: 1};

    const sending = useRef(false);
    const navigate = useNavigate();

    const finilizedOrder = async () => {
        try {
            setLoading(true);
            // to avoid multi submission
            if(!sending.current) {
                sending.current = true;

                // customer info
                if(!currentFirstname || !currentLastname || !currentAddress || !currentContacts?.first) {
                    setErrorMessage({
                        header: 'Customer Info',
                        message: 'Please provide the complete info of the customer.'
                    });
                    setTimeout(() => {
                        localStorage.setItem(breadcrumbsOrder, JSON.stringify([true, true, false, false]));
                        localStorage.removeItem(customerInfo);
                        navigate('/admin/customer-info');
                    }, 4000);
                    throw new Error('Please provide the complete info of the customer.');
                }

                // item
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
                            localStorage.setItem(breadcrumbsOrder, JSON.stringify([true, false, false, false]));
                            localStorage.removeItem(selectedItemsForCashier);
                            localStorage.removeItem(customerInfo);
                            navigate('/admin/cashier');
                        }, 4000);
                        throw new Error('There\'s something wrong.');
                    }
                }

                if(selectedPayment === 'Cash Payment') {
                    // payment recompute everything for security reason
                    let totalPayment = 0;
                    let customerChange = 0;
                    for(const [bill, count] of Object.entries(currentDenominations)) {
                        totalPayment = totalPayment + wordToNumberDenomination[bill] * count;
                    }
                    customerChange = totalPayment - total;
                    if(customerChange < 0 || totalPayment <= 0) { 
                        setErrorMessage({
                            header: 'Customer Payment',
                            message: 'The total payment does not match the purchase amount. Please review the denominations and ensure the full amount is disclosed.'
                        });
                        setTimeout(() => {
                            localStorage.setItem(breadcrumbsOrder, JSON.stringify([true, true, true, false]));
                            localStorage.removeItem(payment);
                            navigate('/admin/payment');
                        }, 4000);
                        throw new Error('The total payment does not match the purchase amount. Please review the denominations and ensure the full amount is disclosed.');
                    }
                }

                // check for method if cash or not so denominations in cast
                // able to be omitted for other types.
                const paymentData = {paymentMethod: selectedPayment};
                if(selectedPayment === 'Cash Payment') {
                    paymentData.cash = {
                        denominations: currentDenominations,
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
                    payment: paymentData
                }
                const response = await sendJSON(urls.neworder, payload);
                if(response) {
                    localStorage.removeItem(selectedItemsForCashier);
                    localStorage.removeItem(customerInfo);
                    localStorage.removeItem(payment);

                    if(selectedPayment === 'Cash Payment') 
                        navigate('/admin/update-cash-drawer');
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
        if(currentPaymentMethod) 
            setSelectedPayment(currentPaymentMethod);
    }, [currentPaymentMethod]);

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
        zPayment.getState()?.reloadPaymentData();

        const selected = zCashierSelectedItem.getState()?.items;
        if(selected) setItemDetails({ ...selected });
        getItems();
    }, []);

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
                h-full md:h-screen bg-neutral-100 flex flex-col overflow-y-auto 
                p-2 sm:p-4
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-track]:rounded-lg
                [&::-webkit-scrollbar-track]:bg-gray-100
                [&::-webkit-scrollbar-thumb]:rounded-lg
                [&::-webkit-scrollbar-thumb]:bg-gray-300
                ">
                {/* Breadcrumbs Section */}
                <section className="w-full h-[30px] flex items-center gap-4">
                    <Breadcrumbs
                        tabNames={['Purchase Items', 'Customer Info', 'Payment', 'Checkout']}
                        tabLinks={['/admin/cashier', '/admin/customer-info', '/admin/payment', '/admin/checkout']}
                        localStorageName={breadcrumbsOrder}
                    />
                </section>

                {/* Main Content */}
                <section 
                    className="grow w-full flex flex-col lg:flex-row gap-4">
                    {/* Customer Info */}
                    <div className="w-full lg:w-1/2 p-8 bg-white shadow-md rounded-lg">
                        <div>
                            <h1 className="font-semibold text-lg">Customer Info</h1>
                            <article className="py-2">
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
                        <hr/>
                        <div className="flex flex-col gap-2 mt-4">
                            <h1 className="font-semibold text-lg">Payment Details.</h1>
                            {selectedPayment==='Cash Payment' ? (
                                <>
                                    <article>
                                        {Object.entries(currentDenominations ?? {}).map((cash, index) => {
                                            const [bill, count] = cash;
                                            if(toNumber(count)===0) return null;
                                            const billNumberFormat = wordToNumberDenomination[bill];
                                            return (
                                                <article key={index} className="flex gap-2 items-center">
                                                    <span>{billNumberFormat}</span>
                                                    <X size={14} />
                                                    <span>{count}</span>
                                                </article>
                                            )
                                        })}
                                    </article>
                                    <article className="w-full flex justify-between">
                                        <span>Total Amount Paid:</span>
                                        <span className="font-semibold">
                                            {formattedCurrency(currentTotalPayment)}
                                        </span>
                                    </article>
                                    <hr/>
                                    <article className="w-full flex justify-between">
                                        <span>Change Due:</span>
                                        <span className="font-semibold">
                                            {formattedCurrency(currentCustomerChange)}
                                        </span>
                                    </article>
                                </>) : (
                                    <article className="flex">
                                        <span>Payment Method:&nbsp;&nbsp;</span>
                                        <span className="font-semibold">{selectedPayment}</span>
                                    </article>
                                )
                            }
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-1/2 p-8 bg-white shadow-md rounded-lg">
                        <h1 className="font-semibold text-lg">Order Summary</h1>
                        <ul className="max-h-[50%] mt-2
                            overflow-x-hidden overflow-y-auto pr-1
                            [&::-webkit-scrollbar]:w-2
                            [&::-webkit-scrollbar-track]:rounded-lg
                            [&::-webkit-scrollbar-track]:bg-gray-100
                            [&::-webkit-scrollbar-thumb]:rounded-lg
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
                        {/* Place Order Button */}
                        <div className="w-full flex justify-end mt-4">
                            <button
                                onClick={() => setPlaceOrderPrompt({header: 'Place Order', message: 'Are you sure you want to place this order?'})}
                                className="h-fit flex gap-2 px-2 py-3 rounded-lg bg-green-600 text-nowrap text-white font-semibold shadow-md hover:bg-green-700 hover:shadow-lg transition"
                            >
                                <ShoppingBag />
                                Complete Sale
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default Checkout;
