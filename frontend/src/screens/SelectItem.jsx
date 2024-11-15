import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ErrorModal } from '@/components/Modal';
import { useLayoutEffect, useState, useRef } from 'react';
import { getData } from '@/utils/send';
import { urls, apiUrl } from '@/constants/urls';
import { formattedDateAndTime } from '@/utils/datetime';
import { formattedNumber } from '@/utils/number';
import { zSelectedItem } from '@/store/selectedItem';

import Searchbar from '@/components/Searchbar';
import Loading from '@/components/Loading';

const SelectItem = () => {
    const [items, setItems] = useState([]);
    const [displayItems, setDisplayItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState({header: '', message: ''});

    const searchBar = useRef(null);
    const checkBoxes = useRef([]);
    const navigate = useNavigate();

    const handleSelectedItems = () => {
        if(selectedItems?.length > 0) {
            zSelectedItem.getState()?.saveSelectedItemData(selectedItems);
            navigate('/admin/cashier');
        } else {
            setErrorMessage({
                header: 'No Selected Item',
                message: 'Item selection is required.'
            });
        }
    }

    const checkBox = (index, itemId) => {
        const isChecked = checkBoxes.current[index].checked;
        checkBoxes.current[index].checked = !isChecked;

        setSelectedItems((state) => {
            if (state.includes(itemId))
                return state.filter((id) => id !== itemId);
            return [...state, itemId];
        });
    }

    const search = (ev) => {
        try {
            const input = ev.target.value.trim().toLowerCase();
            if(!input) return;

            const searched = [];
            for(let i = 0; i < items.length; i++) {
                const item = items[i];
                const productTypeName = String(item?.productTypeName).trim().toLowerCase();
                const deliveryDate = String(item?.deliveryDate).trim();
                const description = String(item?.description).trim().toLocaleLowerCase();
                const itemCode = String(item?.itemCode).trim().toLowerCase();
                const maxDiscount = String(item?.maxDiscount);
                const srp = String(item?.srp);
                const supplierName = String(item?.supplierName).trim().toLowerCase();
                const unit = String(item?.unit).trim().toLocaleLowerCase();

                const isActive = !item?.disabledNote;
                if(
                    productTypeName?.match(input) ||
                    deliveryDate?.match(input) ||
                    description?.match(input) ||
                    itemCode?.match(input) ||
                    maxDiscount?.match(input) ||
                    srp?.match(input) ||
                    supplierName?.match(input) ||
                    unit?.match(input)
                ) {
                    if(isActive){
                        searched.push(item);
                    }
                }
            }

            setDisplayItems(searched);
        } catch(error) {
            console.log(error);
        } finally {}
    }

    const getItems = async () => {
        try {
            setLoading(true);

            const response = await getData(urls?.getitems);
            if(response) {
                // console.log(response?.results);
                const data = response?.results;
                setItems(data);
                setDisplayItems(data);
            }
        } catch(error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        getItems();

        zSelectedItem.getState()?.reloadSelectedItemData();
        const currentSelectedItems = zSelectedItem.getState()?.items || [];
        setSelectedItems(currentSelectedItems);
    }, []);

    if(errorMessage?.header || errorMessage?.message) {
        return (
            <ErrorModal 
                header={errorMessage?.header}
                message={errorMessage?.message} 
                callback={() => setErrorMessage({header: '', message: ''})} 
            />
        )
    }

    if(loading) {
        return (
            <Loading customStyle="w-full h-screen" />
        )
    }

    return (
        <main className=" 
            min-h-screen bg-neutral-100 p-4 lg:px-6
            flex flex-col"
        >
            <section className="flex justify-between items-center gap-4">
                <h1 className="hidden sm:flex font-semibold text-lg">Select Item(s)</h1>
                <Searchbar ref={searchBar} search={search} />
                <button
                    onClick={handleSelectedItems}
                    className="flex gap-2 items-center justify-center leading-none bg-green-600 text-white font-bold rounded-full p-2 sm:pr-4 hover:bg-green-800"
                >
                    <Plus />
                    <span className="hidden sm:flex text-nowrap">Select Item(s)</span>
                </button>
            </section>
            <h1 className="flex sm:hidden font-semibold text-lg">Inventory</h1>
            <section className="grow w-full h-full relative">
                {/* container with scroll bar */}
                <div className="w-full absolute top-0 left-0 right-0 bottom-0 bg-white mt-2 rounded-lg shadow-md
                    overflow-auto
                    [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:rounded-full
                    [&::-webkit-scrollbar-track]:bg-gray-100
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-gray-300
                    dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                    dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500
                ">
                {
                    items?.length > 0 ? (
                        <>{displayItems?.length > 0 ? (
                            <ul className="flex flex-col gap-2 p-2">
                            {
                                displayItems.map((item, index) => {
                                    const isActive = !item?.disabledNote;
                                    const status = isActive ? 'active' : 'inactive';
                                    return (
                                        <li 
                                            key={item?.id}
                                            onClick={() => checkBox(index, item?.id)}
                                        >
                                            <div className={`h-[420px] md:h-[320px] lg:h-fit 
                                                flex flex-col sm:flex-row p-1 pb-2 border border-neutral-300 rounded-lg
                                                ${selectedItems.includes(item?.id) ? 'bg-green-200/75' : 'bg-white'}`}>
                                                <input 
                                                    ref={elem => checkBoxes.current[index] = elem}
                                                    type="checkbox"
                                                    className="size-5 mr-2 mb-2"
                                                    checked={selectedItems.includes(item?.id)}
                                                    onChange={() => checkBox(index, item?.id)}
                                                />
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
                                                    grid grid-cols-2 lg:grid-cols-4 gap-4
                                                    p-2">
                                                    <div className="w-full flex flex-col md:w-fit 
                                                        col-start-1">
                                                        <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                                                            <h3 className="font-semibold lg:text-lg">{item?.productTypeName}</h3>
                                                            <p className={`w-fit h-6 text-white text-sm px-2 rounded-full ${isActive?'bg-green-500':'bg-red-500'}`}>
                                                                {status}
                                                            </p>
                                                        </div>
                                                        <p className="text-[12px]">{item?.description}</p>
                                                        <p className="text-[12px]">Item Code:&nbsp;&nbsp;{item?.itemCode}</p>
                                                        {/* -------------------------------------------------- */}
                                                        {/* display only for small screen */}
                                                        <p className="flex md:hidden text-[12px]">
                                                            {formattedDateAndTime(new Date(item?.deliveryDate))}
                                                        </p>
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
                                                    <div className="w-full flex lg:justify-center 
                                                        row-start-2 lg:row-start-1 lg:col-start-3">
                                                        <img 
                                                            src={`${apiUrl}/barcodes/${item?.barcode}.png`}
                                                            alt="ovida-product-barcode" 
                                                            className="w-[120px] h-[50px] object-contain"
                                                            onError={ev => {
                                                                ev.target.src='../../public/image-off.png'
                                                                ev.onerror=null;
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col items-end md:justify-start
                                                        row-start-1 col-start-2 lg:col-start-4">
                                                        {/* display only for large screen */}
                                                        <p className="hidden text-[12px] md:flex">{formattedDateAndTime(new Date(item?.deliveryDate))}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    )
                                })
                            }
                            </ul>
                        ) : (
                            <div className="w-full h-screen flex justify-center items-center">
                                <h3>Search not found</h3>
                            </div>
                        )}</>
                    ) : (
                        <div className="w-full h-screen flex justify-center items-center">
                            <h3>No items found</h3>
                        </div>
                    )
                }
                </div>
            </section>
        </main>
    );
}

export default SelectItem;