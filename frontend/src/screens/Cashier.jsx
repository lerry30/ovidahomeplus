import { Link } from 'react-router-dom';
import { Plus, Minus, CircleX } from 'lucide-react';
import { useLayoutEffect, useState } from 'react';
import { zSelectedItem } from '@/store/selectedItem';
import { getData } from '@/utils/send';
import { urls, apiUrl } from '@/constants/urls';
import { formattedDateAndTime } from '@/utils/datetime';
import { formattedNumber } from '@/utils/number';

import Loading from '@/components/Loading';

const Cashier = () => {
    const [items, setItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const setSelected = () => {
        const selected = zSelectedItem.getState()?.items || [];
        const selectedData = items.filter(item => selected.includes(item?.id)).reverse();

        setSelectedItems(selectedData);
    }

    const getItems = async () => {
        try {
            setLoading(true);

            const response = await getData(urls?.getitems);
            if(response) {
                // console.log(response?.results);
                const data = response?.results;
                setItems(data);
            }
        } catch(error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        setSelected();
    }, [items]);

    useLayoutEffect(() => {
        zSelectedItem.getState()?.reloadSelectedItemData();
        getItems();
    }, []);

    if(loading) {
        return (
            <Loading customStyle="w-full h-screen" />
        )
    }

    return (
        <main className="absolute top-0 
            left-admin-sidebar-sm lg:left-admin-sidebar-lg 
            w-[calc(100vw-var(--admin-sidebar-width-sm))] lg:w-[calc(100vw-var(--admin-sidebar-width-lg))]
            h-screen bg-neutral-100 p-4 overflow-hidden
            flex flex-col"
        >
            <section className="w-full flex justify-between items-center gap-4">
                <h1 className="font-semibold text-lg">Cashier</h1>
            </section>
            <section className="grow w-full flex flex-col md:flex-row gap-2">
                <div className="w-full md:w-1/2
                    h-full p-2 bg-white shadow-md rounded-lg overflow-hidden">
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
                    <hr />
                    <ul className="w-full h-full flex flex-col gap-2 py-2
                        overflow-y-auto
                        [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-track]:rounded-full
                        [&::-webkit-scrollbar-track]:bg-gray-100
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-thumb]:bg-gray-300
                        dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                        dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
                        {
                            selectedItems?.length > 0 ? (
                                <>{
                                    selectedItems.map(item => (
                                        <li key={item?.id}>
                                            <div className="h-[310px] md:h-[220px] flex flex-col sm:flex-row p-1 pb-2 border border-neutral-300 rounded-lg">
                                                <img 
                                                    src={`${apiUrl}/items/${item?.image}`}
                                                    alt="ovida-product" 
                                                    className="w-[80px] h-[80px] object-contain rounded-lg border mb-4"
                                                    onError={ev => {
                                                        ev.target.src='../../public/image-off.png'
                                                        ev.onerror=null;
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
                                                    </div>
                                                    <p className="text-[12px] md:flex">{formattedDateAndTime(new Date(item?.deliveryDate))}</p>
                                                    <div className="flex justify-end gap-2 py-4">
                                                        <button 
                                                            className="flex gap-2 items-center justify-center leading-none bg-purple-600 text-white font-bold rounded-full p-1 pr-2 hover:bg-purple-800 text-[12px]
                                                            sm:pr-4"
                                                        >
                                                            <Minus />
                                                            Apply Discount
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                // remove
                                                                const selected = zSelectedItem.getState()?.items || [];
                                                                const newSelected = selected.filter(itemId => itemId!==item?.id)
                                                                zSelectedItem.getState()?.saveSelectedItemData(newSelected);
                                                                setSelected();
                                                            }}
                                                            className="flex gap-2 items-center justify-center leading-none bg-red-600 text-white font-bold rounded-full p-1 pr-2 hover:bg-red-800 text-[12px]
                                                            sm:pr-4"
                                                        >
                                                            <CircleX />
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                }</>
                            ) : (
                                <article className="w-full h-full flex justify-center items-center">
                                    <p>No Selected Item</p>
                                </article>
                            )
                        }
                    </ul>
                </div>
                <div className="w-full md:w-1/2 h-full 
                    p-2">
                
                </div>
            </section>
        </main>
    )
}

export default Cashier;