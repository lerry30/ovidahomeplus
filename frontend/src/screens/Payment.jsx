import { X, ReceiptText } from 'lucide-react';
import { ErrorModal } from '@/components/Modal';
import { useNavigate } from 'react-router-dom';
import { useState, useLayoutEffect, useRef } from 'react';
import { breadcrumbsOrder as localStorageName, selectedItemsForCashier } from '@/constants/localStorageNames';
import { toNumber, formattedNumber, formattedCurrency } from '@/utils/number';
import { zCashierSelectedItem } from '@/store/cashierSelectedItem';
import { zPayment } from '@/store/payment';
import { getData } from '@/utils/send';
import { urls } from '@/constants/urls';

import SidebarLayout from '@/components/Sidebar';
import Breadcrumbs from '@/components/Breadcrumbs';
import CashInput from '@/components/CashInput';
import Loading from '@/components/Loading';

const Payment = () => {
    const currentPaymentMethod = zPayment(state => state.paymentMethod);
    const currentDenominations = zPayment(state => state?.cash?.denominations);
    const currentTotalPayment = zPayment(state => state?.cash?.totalPayment);
    const currentCustomerChange = zPayment(state => state?.cash?.change);

    const [data, setData] = useState({onethousand: 0, fivehundred: 0, twohundred: 0, onehundred: 0, fifty: 0, twenty: 0, ten: 0, five: 0, one: 0});
    const [selectedItems, setSelectedItems] = useState([]); // from local storage which is the customer order details or it is just info of the order
    const [items, setItems] = useState([]);
    const [itemDetails, setItemDetails] = useState({});
    const [totalPurchaseAmount, setTotalPurchaseAmount] = useState(0);
    const [totalPayment, setTotalPayment] = useState(0);
    const [totalCustomerChange, setTotalCustomerChange] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('Cash Payment');
    const [loading, setLoading] = useState(false);
    const [errorPrompt, setErrorPrompt] = useState(false);

    const wordToNumberDenomination = {onethousand: 1000, fivehundred: 500, twohundred: 200, onehundred: 100, fifty: 50, twenty: 20, ten: 10, five: 5, one: 1};

    const navigate = useNavigate();

    const handlePayment = async () => {
        try {
            const paymentData = {method: paymentMethod};
            if(paymentMethod === 'Cash Payment') {
                if(Object.values(data).length === 0 || 
                    totalCustomerChange < 0 || 
                    totalPayment <= 0) { 
                    setErrorPrompt(true);
                    throw new Error('The total payment does not match the purchase amount. Please review the denominations and ensure the full amount is disclosed.');
                }
                paymentData.cashData = {denominations: data, totalPayment, change: totalCustomerChange};
            }
            zPayment.getState().savePaymentData(paymentData);
            navigate('/admin/checkout');
        } catch(error) {
            console.log(error);
        }
    }

    const computePayment = () => {
        let total = 0;
        for(const [bill, count] of Object.entries(data)) {
            const cash = wordToNumberDenomination[bill];
            total = total + cash * count;
        }
        setTotalPayment(total);

        const change = total - totalPurchaseAmount;
        setTotalCustomerChange(change);
    }

    const computeTotal = () => {
        const overAllTotal = selectedItems.reduce((t, item) => {
            const quantity = itemDetails[item?.id]?.barcodes?.length; 
            const isDiscounted = itemDetails[item?.id]?.isDiscounted;
            if (isDiscounted) return t + toNumber(item?.maxDiscount) * toNumber(quantity)
            return t + toNumber(item?.srp) * toNumber(quantity);
        }, 0);
        setTotalPurchaseAmount(overAllTotal);
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
        if(currentPaymentMethod) setPaymentMethod(currentPaymentMethod);
    }, [currentPaymentMethod]);

    useLayoutEffect(() => {
        if(currentDenominations && 
            currentTotalPayment>0 && currentCustomerChange>=0 &&
            totalPurchaseAmount>0) {
            let total = 0;
            for(const bill of Object.keys(data)) {
                const nDenom = currentDenominations[bill];
                data[bill] = nDenom;
                total = total + wordToNumberDenomination[bill] * nDenom;
            }
            const change = total - totalPurchaseAmount;
            setTotalPayment(total);
            setTotalCustomerChange(change);
            
        } 
    }, [currentDenominations, currentTotalPayment, currentCustomerChange, totalPurchaseAmount]);

    useLayoutEffect(() => {
        if(errorPrompt) { 
            setTimeout(() => {
                setErrorPrompt(false)
            }, 3000);
        }
    }, [errorPrompt]);
    
    useLayoutEffect(computePayment, [data]);
    useLayoutEffect(computeTotal, [selectedItems]);
    useLayoutEffect(setSelectedToDisplay, [items]);

    useLayoutEffect(() => {
        // verify
        const selectedItems = JSON.parse(localStorage.getItem(selectedItemsForCashier) || '{}');
        if(Object.keys(selectedItems).length === 0) navigate('/admin/cashier');

        zCashierSelectedItem.getState()?.reloadSelectedItemData();
        zPayment.getState()?.reloadPaymentData();

        const selected = zCashierSelectedItem.getState()?.items;
        if(selected) setItemDetails({ ...selected });
        getItems();
    }, []);

    if(errorPrompt) {
        return (
            <ErrorModal 
                header="Incomplete Payment Details"
                message="The total payment does not match the purchase amount. Please review the denominations and ensure the full amount is disclosed."  
                callback={() => setErrorPrompt(false)} 
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
                h-full lg:h-screen bg-neutral-100 p-2 sm:p-4
                flex flex-col
                overflow-hidden
            ">
                <section className="w-full h-[30px] flex items-center gap-4">
                    <div className="">
                        <Breadcrumbs
                            tabNames={['Purchase Items', 'Customer Info', 'Payment', 'Checkout']}
                            tabLinks={['/admin/cashier', '/admin/customer-info', '/admin/payment', '/admin/checkout']}
                            localStorageName={localStorageName}
                        />
                    </div>
                </section>

                {/* Header Section */}
                <header className="w-full">
                    <h1 className="text-2xl font-bold text-gray-800">Payment Breakdown</h1>
                    {/*<p className="text-sm text-gray-600">Track and manage cash in the drawer based on bills paid by the customer.</p>*/}
                </header>

                <section 
                    className="grow w-full h-full flex bg-white rounded-lg py-4 px-6 flex-col 
                        lg:flex-row lg:px-4
                        overflow-x-hidden overflow-y-auto
                        [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-track]:rounded-lg
                        [&::-webkit-scrollbar-track]:bg-gray-100
                        [&::-webkit-scrollbar-thumb]:rounded-lg
                        [&::-webkit-scrollbar-thumb]:bg-gray-300
                    ">
                    <div className="flex flex-col gap-2 pr-1 mb-2">
                        <PaymentOption name="Cash Payment" method={paymentMethod} setMethod={setPaymentMethod} />
                        <PaymentOption name="E-Wallet" method={paymentMethod} setMethod={setPaymentMethod} />
                        <PaymentOption name="Credit/Debit Card" method={paymentMethod} setMethod={setPaymentMethod} />
                        <PaymentOption name="Bank Transfer" method={paymentMethod} setMethod={setPaymentMethod} />
                    </div>
                    {paymentMethod==='Cash Payment' && (
                        <>
                            <div className="w-full flex flex-col p-2 gap-2 lg:pr-4">
                                <CashInput text="One Thousand" id="one-thousand" cash="onethousand" data={data} setData={setData} />
                                <CashInput text="Five Hundred" id="five-hundred" cash="fivehundred" data={data} setData={setData} />
                                <CashInput text="Two Hundred" id="two-hundred" cash="twohundred" data={data} setData={setData} />
                                <CashInput text="One Hundred" id="one-hundred" cash="onehundred" data={data} setData={setData} />
                                <CashInput text="Fifty" id="fifty" cash="fifty" data={data} setData={setData} />
                            </div>
                            <div className="w-full flex flex-col p-2 gap-4 lg:pl-4">
                                <CashInput text="Twenty" id="twenty" cash="twenty" data={data} setData={setData} />
                                <CashInput text="Ten" id="ten" cash="ten" data={data} setData={setData} />
                                <CashInput text="Five" id="five" cash="five" data={data} setData={setData} />
                                <CashInput text="One" id="one" cash="one" data={data} setData={setData} />
                            </div>
                        </>
                    )}
                    <div className="w-full text-nowrap flex flex-col gap-4 p-4 border border-neutral-300 rounded-md mb-2">
                        <article>
                            <h2>Total Purchase Amount:</h2>
                            <span className="font-semibold text-xl pl-4 pt-2">
                                {formattedCurrency(totalPurchaseAmount)}
                            </span>
                        </article>
                        {paymentMethod==='Cash Payment' && (
                            <article>
                                {totalPayment>0 && (
                                    <>
                                        <article>
                                            <h2>Customer Payment:</h2>
                                            {Object.entries(data).map((cash, index) => {
                                                const [bill, count] = cash;
                                                if(toNumber(count)===0) return null;
                                                return (
                                                    <article key={index} className="flex gap-2 items-center font-semibold text-xl pl-4">
                                                        <span>{wordToNumberDenomination[bill]}</span>
                                                        <X size={14} />
                                                        <span>{count}</span>
                                                    </article>
                                                )
                                            })}
                                        </article>
                                        <article>
                                            <h2>Total Payment:</h2>
                                            <span className="font-semibold text-xl pl-4 pt-2">
                                                {formattedCurrency(totalPayment)}
                                            </span>
                                        </article>
                                    </>
                                )}
                                {totalCustomerChange>0 && (
                                    <article>
                                        <h2>Customer Change:</h2>
                                        <span className="font-semibold text-xl pl-4 pt-2">
                                            {formattedCurrency(totalCustomerChange)}
                                        </span>
                                    </article>
                                )}
                            </article>
                        )}
                        <div className={`w-full flex py-6 ${paymentMethod!=='Cash Payment'?'flex-start':'flex-end'}`}>
                            <button
                                onClick={handlePayment}
                                className={`flex gap-2 items-center justify-center leading-none font-bold rounded-lg p-2 sm:px-4 
                                bg-green-600 text-white hover:bg-green-800 ${!totalCustomerChange<0 ? 'pointer-events-none opacity-70' : ''}`}
                            >
                                <ReceiptText />
                                <span className="hidden sm:flex text-nowrap">Review Details</span>
                            </button>
                        </div>
                    </div>
                    {/*<div className="w-full text-nowrap flex flex-col gap-4 p-4 border border-neutral-300 rounded-md mb-2">
                        <article>
                            <h2>Cash Drawer</h2>
                            <span className="font-semibold text-xl pl-4 pt-2">
                                
                            </span>
                        </article>
                        <article>
                            <h2>Total:</h2>
                            <span className="font-semibold text-xl pl-4 pt-2">
                                
                            </span>
                        </article>
                    </div>*/}
                </section>
            </main>
        </div>
    );
};

export default Payment;

const PaymentOption = ({ name, children, method, setMethod }) => {
    const isSelected = method===name;
    return (
        <div 
            onClick={() => setMethod(name)}
            className={`flex-1 rounded-md p-4 border shadow-md hover:shadow-lg cursor-pointer flex flex-col gap-2
                ${isSelected ? 'bg-green-600/10 border-green-500' : 'bg-white border-gray-300'}`}>
            <div className="flex items-center gap-2">
                <input 
                    type="radio" 
                    name="payment" 
                    value={name}
                    checked={isSelected} 
                    onChange={() => setMethod(name)}
                    className="w-5 h-5 accent-green-600" 
                />
                <h3 className="font-semibold text-gray-800">{name}</h3>
            </div>
            {children}
        </div>
    )
}
