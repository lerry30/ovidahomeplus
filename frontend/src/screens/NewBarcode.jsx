import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { ErrorModal } from '@/components/Modal';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useLayoutEffect, useState, useRef } from 'react';
import { getData, sendJSON } from '@/utils/send';
import { urls, apiUrl } from '@/constants/urls';
import { toNumber, formattedNumber } from '@/utils/number';
import { isValidDate, formattedDate } from '@/utils/datetime';
import { zBatch } from '@/store/batch';

import Searchbar from '@/components/Searchbar';
import SidebarLayout from '@/components/Sidebar';
import Loading from '@/components/Loading';
import ErrorField from '@/components/ErrorField';

const NewBarcode = () => {
    const batchId = zBatch(state => state?.id);
    const supplierId = zBatch(state => state?.supplierId);
    const supplierName = zBatch(state => state?.supplierName);
    const selectedBatchNo = zBatch(state => state?.batchNo);
    const selectedBatchDate = zBatch(state => state?.date);

    const [items, setItems] = useState([]);
    const [displayItems, setDisplayItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [errorMessage, setErrorMessage] = useState({header: '', message: ''});
    const [errorData, setErrorData] = useState({quantity: ''});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const searchBar = useRef(null);
    const pageOffset = useRef(1);

    const PAGINATE_NO = 4;

    const handleNewBarcode = async () => {
        try{
            setLoading(true);
            const batchDate = formattedDate(new Date(selectedBatchDate));

            if(!batchId) {
                setErrorMessage({
                    header: 'Undefined Batch.',
                    message: 'Batch is not found.'
                });
                throw new Error('Batch is not found.');
            }

            if(!selectedBatchNo) {
                setErrorMessage({
                    header: 'Undefined Batch.',
                    message: 'Batch number is required.'
                });
                throw new Error('Batch number is required.');
            }

            if(!isValidDate(batchDate)) {
                setErrorMessage({
                    header: 'Date Error.',
                    message: 'Batch date is required.'
                });
                throw new Error('Batch date is required.');
            }

            if(!selectedItem) {
                setErrorMessage({
                    header: 'No Selected Item',
                    message: 'Item selection is required.'
                });
                throw new Error('Item selection is required.');
            }

            if(!quantity || quantity <= 0) {
                setErrorData(state => ({...state, quantity: 'Quantity must be greater than zero.'}));
                throw new Error('Quantity must be greater than zero.');
            }

            const payload = {batchId, itemId: selectedItem, quantity};
            const response = await sendJSON(urls.newbarcode, payload);

            if(response) {
                const data = response?.results;
                //console.log(data);
                navigate(`/admin/barcodes/${selectedBatchNo}`);
            }
        } catch(error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    const checkBox = (itemId) => {
        setSelectedItem(state => {
            if(itemId === state) return 0;
            return itemId;
        });
    }

    const search = async (ev) => {
        try {
            const input = ev.target.value.trim().toLowerCase();
            if(!input) {
                setDisplayItems(items);
                return;
            }

            const payload = {input: `${supplierName} ${input}`};
            const response = await sendJSON(urls.searchitems, payload);
            if(response) {
                //console.log(response?.results);
                const data = response?.results;
                const searched = [];
                for(const searchedItem of data) {
                    if(searchedItem?.disabledNote) continue;
                    searched.push(searchedItem);
                }
                setDisplayItems(searched);
            }
        } catch(error) {
            console.log(error);
        }
    }

    // I don't want to get the items with excluded sold items since
    // since the page needs to add quantity and generate new barcode
    // so it means it needs to display items even they have zero quantity.
    const getItems = async (offset) => {
        try {
            setLoading(true);
            pageOffset.current = offset;
            // excluded sold items but disabled are included with zero quantity
            const payload = {supplierId, limit: PAGINATE_NO, offset};
            const response = await sendJSON(urls?.getitemsbysupplier, payload);
            if(response) {
                // console.log(response?.results);
                // filter data if it has 
                const data = response?.results;
                const fData = [];
                for(const item of data) {
                    if(!item?.disabledNote) {
                        fData.push(item);
                    }
                }

                setItems(fData);
                setDisplayItems(fData);
            }
        } catch(error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        if(errorMessage) setTimeout(() => setErrorMessage({}), 2000)
    }, [errorMessage]);

    useLayoutEffect(() => {
        getItems(pageOffset.current);

        zBatch.getState()?.reloadBatchData();
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

        /*<main className=" 
            min-h-screen bg-neutral-100 p-4 lg:px-6
            flex flex-col overflow-hidden"
        >*/
    return (
        <div className="w-full min-h-screen bg-neutral-50">
            <SidebarLayout />
            <main
                className="absolute top-0 left-admin-sidebar-sm lg:left-admin-sidebar-lg
                    w-[calc(100vw-var(--admin-sidebar-width-sm))] lg:w-[calc(100vw-var(--admin-sidebar-width-lg))]
                    h-full md:h-screen bg-neutral-100 p-2 sm:p-4 lg:px-6 
                    flex flex-col overflow-y-auto
                    [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-lg [&::-webkit-scrollbar-track]:bg-gray-100
                    [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-gray-300"
            >
                <header className="w-full h-[40px] flex items-center">
                    <h1 className="font-semibold text-lg px-4">
                        Add Item for {supplierName}
                    </h1>
                </header>
                <div className="h-full flex flex-col bg-neutral-100 pt-2">
                    <section className="w-full flex justify-between items-center gap-4">
                        <div className="w-full  bg-white p-2 rounded-lg shadow-sm overflow-hidden
                            flex flex-col md:flex-row md:items-end gap-4
                        ">
                            <div className="flex flex-col">
                                <label htmlFor="quantity" className="font-semibold">
                                    Quantity
                                    <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    id="quantity"
                                    value={quantity}
                                    onChange={elem => {
                                        const input = toNumber(elem.target.value);
                                        setQuantity(input);
                                    }}
                                    className="max-w-96 outline-none border-2 border-neutral-400 rounded-lg py-2 px-4"
                                    required
                                />
                                <ErrorField message={errorData?.quantity || ''} />
                            </div>
                            <button
                                onClick={handleNewBarcode}
                                className="max-w-96 h-[40px] flex gap-2 items-center justify-center leading-none bg-green-600 text-white font-bold rounded-lg p-2 sm:pr-4 hover:bg-green-800"
                            >
                                <Plus />
                                <span className="hidden sm:flex text-nowrap">Create Item</span>
                            </button>
                            <Link 
                                to={`/admin/barcodes/${batchId}`}
                                className="max-w-96 h-[40px] flex items-center justify-center leading-none font-bold rounded-lg p-4 text-white bg-gray-500 hover:bg-gray-600"
                            >
                                Cancel
                            </Link>
                        </div>
                    </section>
                    <section className="grow w-full h-full relative">
                        {/* container with scroll bar */}
                        <div className="w-full absolute top-0 left-0 right-0 bottom-0 bg-white mt-1 rounded-lg shadow-md overflow-hidden">
                            <div className="h-[50px] border-b p-2 flex items-center justify-between">
                                <h1 className="hidden sm:flex font-semibold text-lg">Select an Item</h1>
                                <Searchbar ref={searchBar} search={(ev) => search(ev)} />
                                <div className="flex md:gap-2">
                                    <button
                                        onClick={() => getItems(Math.max(pageOffset.current-1, 1))}
                                        className="flex">
                                        <ChevronLeft />
                                    </button>
                                    <span>{pageOffset.current}</span>
                                    <button 
                                        onClick={() => getItems(pageOffset.current+1)}
                                        className="flex">
                                        <ChevronRight />
                                    </button>
                                </div>
                            </div>
                            {
                                items?.length > 0 ? (
                                    <>{displayItems?.length > 0 ? (
                                        <ul className="w-full h-full flex flex-col gap-2 p-2 pb-20
                                            overflow-y-auto
                                            [&::-webkit-scrollbar]:w-2
                                            [&::-webkit-scrollbar-track]:rounded-lg
                                            [&::-webkit-scrollbar-track]:bg-gray-100
                                            [&::-webkit-scrollbar-thumb]:rounded-lg
                                            [&::-webkit-scrollbar-thumb]:bg-gray-300
                                        ">
                                        {
                                            displayItems.map((item, index) => {
                                                const isActive = !item?.disabledNote;
                                                const status = isActive ? 'active' : 'inactive';
                                                const isSelected = selectedItem === item?.id;
                                                return (
                                                    <li 
                                                        key={item?.id}
                                                        onClick={() => checkBox(item?.id)}
                                                    >
                                                        <div className={`h-[420px] md:h-[320px] lg:h-fit 
                                                            flex flex-col sm:flex-row p-1 pb-2 border border-neutral-300 rounded-lg
                                                            ${isSelected ? 'bg-green-200/75' : 'bg-white'}`}>
                                                            <img 
                                                                src={`${apiUrl}/fl/items/${item?.image}`}
                                                                alt="ovida-product" 
                                                                className="w-[80px] h-[80px] object-contain rounded-lg border mb-4"
                                                                onError={ev => {
                                                                    ev.target.src=`${apiUrl}/image-off.png`
                                                                    ev.onerror=null; // prevents infinite loop
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
                                                                        <p className={`w-fit h-6 text-white text-sm px-2 rounded-lg ${isActive?'bg-green-500':'bg-red-500'}`}>
                                                                            {status}
                                                                        </p>
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
                                                                <div className="w-full flex lg:justify-center 
                                                                    row-start-2 lg:row-start-1 lg:col-start-3">
                                                                    {/* <article>
                                                                        <span>Quantity:&nbsp;&nbsp;</span>
                                                                        <span className="font-semibold">
                                                                            {item?.quantity}
                                                                        </span>
                                                                    </article> */}
                                                                    {/* <img 
                                                                        src={`${apiUrl}/fl/barcodes/${item?.barcode}.png`}
                                                                        alt="ovida-product-barcode" 
                                                                        className="w-[120px] h-[50px] object-contain"
                                                                        onError={ev => {
                                                                            ev.target.src=`${apiUrl}/image-off.png`
                                                                            ev.onerror=null; // prevents infinite loop
                                                                        }}
                                                                    /> */}
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
                </div>
            </main>
        </div>
    );
}

export default NewBarcode;


//const search = (ev) => {
//    try {
//        const input = ev.target.value.trim().toLowerCase();
//        if(!input) {
//            setDisplayItems(items);
//            return;
//        }

//        const searched = [];
//        for(let i = 0; i < items.length; i++) {
//            const item = items[i];
//            const productTypeName = String(item?.productTypeName).trim().toLowerCase();
//            const description = String(item?.description).trim().toLocaleLowerCase();
//            const itemCode = String(item?.itemCode).trim().toLowerCase();
//            const maxDiscount = String(item?.maxDiscount);
//            const srp = String(item?.srp);
//            const supplierName = String(item?.supplierName).trim().toLowerCase();
//            const unit = String(item?.unit).trim().toLocaleLowerCase();
//            const barcode = String(item?.barcode).trim();

//            const isActive = !item?.disabledNote;
//            if(
//                productTypeName?.match(input) ||
//                description?.match(input) ||
//                itemCode?.match(input) ||
//                maxDiscount?.match(input) ||
//                srp?.match(input) ||
//                supplierName?.match(input) ||
//                unit?.match(input) ||
//                barcode?.match(input)
//            ) {
//                if(isActive){
//                    searched.push(item);
//                }
//            }
//        }

//        setDisplayItems(searched);
//    } catch(error) {
//        console.log(error);
//    } finally {}
//}
