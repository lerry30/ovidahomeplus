import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, ShoppingBag } from 'lucide-react';
import { useLayoutEffect, useState } from 'react';
import { zCashierSelectedItem } from '@/store/cashierSelectedItem';
import { getData } from '@/utils/send';
import { urls, apiUrl } from '@/constants/urls';
import { formattedDateAndTime } from '@/utils/datetime';
import { toNumber, formattedNumber } from '@/utils/number';
import { breadcrumbsOrder as localStorageName } from '@/constants/localStorageNames';

import Loading from '@/components/Loading';
import Breadcrumbs from '@/components/Breadcrumbs';

const Cashier = () => {
    const [items, setItems] = useState([]); // from database
    const [selectedItems, setSelectedItems] = useState([]);
    const [itemDetails, setItemDetails] = useState({});
    const [total, setTotal] = useState(0);
    const [recomputeTotal, setRecomputeTotal] = useState(false); // trigger
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const checkout = () => {
        if(total > 0) {
            navigate('/admin/customer-info');
        }
    }

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
        setRecomputeTotal(!recomputeTotal);
    }

    const computeTotal = () => {
        const overAllTotal = selectedItems.reduce((t, item) => {
            const {quantity, isDiscounted} = itemDetails[item?.id];
            if(isDiscounted) return t + toNumber(item?.maxDiscount) * toNumber(quantity)
            return t + toNumber(item?.srp) * toNumber(quantity);
        }, 0);
        setTotal(overAllTotal);
    }

    const enableDiscount = (item) => {
        const selected = zCashierSelectedItem.getState()?.items || [];
        if (selected.hasOwnProperty(item?.id) && selected[item?.id].hasOwnProperty('isDiscounted')) {
            selected[item?.id].isDiscounted = !selected[item?.id].isDiscounted;
        }
        zCashierSelectedItem.getState()?.saveSelectedItemData(selected);
        setItemDetails({...selected});
        setRecomputeTotal(!recomputeTotal);
    }

    const increaseItemQuantity = (item) => {
        const selected = zCashierSelectedItem.getState()?.items || [];
        if (selected.hasOwnProperty(item?.id)) {
            if(selected[item?.id].quantity < item?.quantity) {
                selected[item?.id].quantity++;
            }
        }
        zCashierSelectedItem.getState()?.saveSelectedItemData(selected);
        setItemDetails({...selected});
        setRecomputeTotal(!recomputeTotal);
    }

    const decreaseItemQuantity = (item) => {
        const selected = zCashierSelectedItem.getState()?.items || [];
        // console.log(sItem, item?.id);
        if (selected.hasOwnProperty(item?.id)) {
            if(selected[item?.id]?.quantity <= 1) {
                delete selected[item?.id] 
                setSelectedItems(state => state?.filter(sItem => sItem?.id!==item?.id));
            } else {
                selected[item?.id].quantity--;
            }
        }

        zCashierSelectedItem.getState()?.saveSelectedItemData(selected);
        setItemDetails({...selected});
        setRecomputeTotal(!recomputeTotal);
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
        computeTotal();
    }, [recomputeTotal])

    useLayoutEffect(() => {
        setSelectedToDisplay();
    }, [items]);

    useLayoutEffect(() => {
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
        <main className="absolute top-0 
            left-admin-sidebar-sm lg:left-admin-sidebar-lg 
            w-[calc(100vw-var(--admin-sidebar-width-sm))] lg:w-[calc(100vw-var(--admin-sidebar-width-lg))]
            h-full md:h-screen bg-neutral-100 p-4
            flex flex-col
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
            {/* this container has fixed value that depends on the header above. Also the 26px is for padding */}
            <section className="grow w-full h-[calc(100vh-30px-26px)] flex flex-col md:flex-row gap-4
                    overflow-x-hidden overflow-y-auto
                    [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:rounded-full
                    [&::-webkit-scrollbar-track]:bg-gray-100
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-gray-300
                    dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                    dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500
            ">
                <div className="w-full md:w-1/2
                    h-[calc((100vh-30px-26px)/2)] md:h-full p-2 
                    bg-white shadow-md rounded-lg overflow-hidden">
                    <header className="w-full flex justify-between pb-2">
                        <h2>Items</h2>
                        <Link
                            to="/admin/select-item"
                            className="flex gap-2 items-center justify-center leading-none bg-green-600 text-white font-bold rounded-full p-1 sm:pr-4 hover:bg-green-800"
                        >
                            <Plus />
                            <span className="hidden sm:flex text-nowrap">Select Item</span>
                        </Link>
                    </header>
                    <ul className="
                        w-full h-full flex flex-col gap-2 pb-10 pr-1
                        overflow-y-auto
                        [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-track]:rounded-full
                        [&::-webkit-scrollbar-track]:bg-gray-100
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-thumb]:bg-gray-300
                        dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                        dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500
                    ">
                        {
                            selectedItems?.length > 0 ?
                                selectedItems.map(item => (
                                    <li key={item?.id}>
                                        <div className="h-[340px] sm:h-[270px] md:h-[280px] lg:h-[230px] 
                                            flex flex-col sm:flex-row p-1 pb-2 border border-neutral-300 rounded-lg">
                                            <img
                                                src={`${apiUrl}/items/${item?.image}`}
                                                alt="ovida-product"
                                                className="w-[80px] h-[80px] object-contain rounded-lg border mb-4"
                                                onError={ev => {
                                                    ev.target.src = '../../public/image-off.png'
                                                    ev.onerror = null;
                                                }}
                                            />
                                            <hr />
                                            <div className="w-full xl:h-[90px] 
                                                flex flex-col
                                                p-2">
                                                <div className="w-full flex flex-col md:w-fit 
                                                    col-start-1">
                                                    <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                                                        <h3 className="font-semibold">{item?.productTypeName}</h3>
                                                    </div>
                                                    <p className="text-[12px]">{item?.description}</p>
                                                    <p className="text-[12px]">Item Code:&nbsp;&nbsp;{item?.itemCode}</p>
                                                    <p className="text-red-500 font-semibold italic text-[14px]">
                                                        {item?.disabledNote}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col text-sm 
                                                    row-start-3 lg:row-start-1 lg:col-start-2">
                                                    <article>
                                                        <span>Supplier:&nbsp;&nbsp;</span>
                                                        <span className="font-semibold">
                                                            {item.supplierName}
                                                        </span>
                                                    </article>
                                                    <article>
                                                        <span>SRP:&nbsp;&nbsp;</span>
                                                        <span className="font-semibold">
                                                            ₱ {formattedNumber(item?.srp)}
                                                        </span>
                                                    </article>
                                                    <article>
                                                        <span>Max discount:&nbsp;&nbsp;</span>
                                                        <span className="font-semibold">
                                                            ₱ {formattedNumber(item?.maxDiscount)}
                                                        </span>
                                                    </article>
                                                    <article>
                                                        <span>Stock:&nbsp;&nbsp;</span>
                                                        <span className="font-semibold">
                                                            {formattedNumber(item?.quantity)}
                                                        </span>
                                                    </article>
                                                </div>
                                                <p className="text-[12px] md:flex">{formattedDateAndTime(new Date(item?.updatedAt))}</p>
                                                <div className="flex flex-col lg:flex-row gap-2 pt-1">
                                                    <div className="flex gap-2">
                                                        {/* <button 
                                                            onClick={() => {
                                                                // remove
                                                                const selected = zCashierSelectedItem.getState()?.items || [];
                                                                const newSelected = selected.filter(itemId => itemId!==item?.id)
                                                                zCashierSelectedItem.getState()?.saveSelectedItemData(newSelected);
                                                                setSelectedToDisplay();
                                                            }}
                                                            className="flex gap-2 items-center justify-center leading-none bg-red-600 text-white font-bold rounded-full p-1 pr-2 hover:bg-red-800 text-[12px]
                                                            sm:pr-4"
                                                        >
                                                            <CircleX />
                                                            Remove
                                                        </button> */}
                                                        <button
                                                            onClick={() => enableDiscount(item)}
                                                            className="flex gap-2 items-center justify-center leading-none bg-purple-600 text-white font-bold rounded-full p-1 pr-2 hover:bg-purple-800 text-[12px]
                                                            sm:pr-4"
                                                        >
                                                            <Minus />
                                                            {itemDetails[item?.id]?.isDiscounted?'Revert to Original Price':'Apply Discount'}
                                                        </button>
                                                    </div>
                                                    <div className="w-full flex justify-end items-center gap-2">
                                                        <button
                                                            onClick={() => decreaseItemQuantity(item)}
                                                            className="bg-neutral-500 rounded-lg text-white"
                                                        >
                                                            <Minus />
                                                        </button>
                                                        <span className="text-nowrap">{`${itemDetails[item?.id]?.quantity} ${item.unit}`}</span>
                                                        <button 
                                                            onClick={() => increaseItemQuantity(item)}
                                                            className="bg-neutral-500 rounded-lg text-white"
                                                        >
                                                            <Plus />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            :
                                <article className="w-full h-full flex justify-center items-center">
                                    <p>No Selected Item</p>
                                </article>
                        }
                    </ul>
                </div>
                <div className="w-full md:w-1/2
                    h-[calc((100vh-30px-26px)/2)] md:h-full p-2 
                    bg-white shadow-md rounded-lg overflow-hidden 
                    pb-20 lg:pb-0">
                    <header className="w-full flex justify-between pb-2">
                        <h2>Summary</h2>
                    </header>
                    <ul className="w-full max-h-[70%] flex flex-col pb-10
                        border border-neutral-50 bg-neutral-100 rounded-md
                        overflow-y-auto 
                        [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-track]:rounded-full
                        [&::-webkit-scrollbar-track]:bg-gray-100
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-thumb]:bg-gray-300
                        dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                        dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500
                    ">
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
                    <article className="w-full px-4 pt-4 flex justify-between items-center">
                        <span className="text-nowrap font-semibold text-lg">Total</span>
                        <div className="w-full border-t border-neutral-500 border-dashed mx-2 mt-1"></div>
                        <span className="text-nowrap font-semibold text-lg">₱ {formattedNumber(total)}</span>
                    </article>
                    <div className="w-full flex justify-end py-6">
                        <button
                            onClick={checkout}
                            className={`flex gap-2 items-center justify-center leading-none font-bold rounded-full p-2 sm:px-4 
                            bg-green-600 text-white hover:bg-green-800 ${!total ? 'pointer-events-none opacity-50' : ''}`}
                        >
                            <ShoppingBag />
                            <span className="hidden sm:flex text-nowrap">Proceed to Checkout</span>
                        </button>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Cashier;