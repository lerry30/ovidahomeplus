import { Plus } from 'lucide-react';
import { ErrorModal } from '@/components/Modal';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useLayoutEffect, useState, useRef } from 'react';
import { getData, sendJSON } from '@/utils/send';
import { urls, apiUrl } from '@/constants/urls';
import { formattedNumber } from '@/utils/number';
import { toNumber } from '@/utils/number';

import Searchbar from '@/components/Searchbar';
import Loading from '@/components/Loading';
import ErrorField from '@/components/ErrorField';

const NewBarcode = () => {
    const [items, setItems] = useState([]);
    const [displayItems, setDisplayItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [errorMessage, setErrorMessage] = useState({header: '', message: ''});
    const [errorData, setErrorData] = useState({quantity: ''});
    const [loading, setLoading] = useState(false);

    const searchBar = useRef(null);
    const navigate = useNavigate();
    const selectedBatchNo = useParams()?.batch;

    const handleNewBarcode = async () => {
        try{
            setLoading(true);
            if(!selectedBatchNo) {
                setErrorMessage({
                    header: 'Undefined batch number.',
                    message: 'Batch number is required.'
                });
                throw new Error('Batch number is required.');
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

            const payload = {batchNo: selectedBatchNo, itemId: selectedItem, quantity};
            const response = await sendJSON(urls.newbarcode, payload);

            if(response) {
                const data = response?.results;
                console.log(data);
                navigate('/admin/barcodes');
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

    const search = (ev) => {
        try {
            const input = ev.target.value.trim().toLowerCase();
            if(!input) {
                setDisplayItems(items);
                return;
            }

            const searched = [];
            for(let i = 0; i < items.length; i++) {
                const item = items[i];
                const productTypeName = String(item?.productTypeName).trim().toLowerCase();
                const description = String(item?.description).trim().toLocaleLowerCase();
                const itemCode = String(item?.itemCode).trim().toLowerCase();
                const maxDiscount = String(item?.maxDiscount);
                const srp = String(item?.srp);
                const supplierName = String(item?.supplierName).trim().toLowerCase();
                const unit = String(item?.unit).trim().toLocaleLowerCase();
                const barcode = String(item?.barcode).trim();

                const isActive = !item?.disabledNote;
                if(
                    productTypeName?.match(input) ||
                    description?.match(input) ||
                    itemCode?.match(input) ||
                    maxDiscount?.match(input) ||
                    srp?.match(input) ||
                    supplierName?.match(input) ||
                    unit?.match(input) ||
                    barcode?.match(input)
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

            // I don't want to get the items with excluded sold items since
            // since the page needs to add quantity and generate new barcode
            // so it means it needs to display items even they have zero quantity.
            const response = await getData(urls?.getitems);
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
        getItems();
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
            flex flex-col overflow-hidden"
        >
            <section className="w-full h-full flex justify-between items-center gap-4">
                <div className="w-full h-full  bg-white p-2 pb-6 rounded-lg shadow-sm overflow-hidden
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
                            className="max-w-96 outline-none border-2 border-neutral-400 rounded-full py-2 px-4"
                            required
                        />
                        <ErrorField message={errorData?.quantity || ''} />
                    </div>
                    <button
                        onClick={handleNewBarcode}
                        className="max-w-96 h-[40px] flex gap-2 items-center justify-center leading-none bg-green-600 text-white font-bold rounded-full p-2 sm:pr-4 hover:bg-green-800"
                    >
                        <Plus />
                        <span className="hidden sm:flex text-nowrap">Create Item</span>
                    </button>
                    <Link 
                        to="/admin/barcodes" 
                        className="max-w-96 h-[40px] flex items-center justify-center leading-none font-bold rounded-full p-4 text-white bg-gray-500 hover:bg-gray-600"
                    >
                        Cancel
                    </Link>
                </div>
            </section>
            <section className="grow w-full h-full relative">
                {/* container with scroll bar */}
                <div className="w-full absolute top-0 left-0 right-0 bottom-0 bg-white mt-4 rounded-lg shadow-md overflow-hidden">
                    <div className="h-[50px] border-b p-2 flex items-center gap-10">
                        <h1 className="hidden sm:flex font-semibold text-lg">Select an Item</h1>
                        <Searchbar ref={searchBar} search={search} />
                    </div>
                    {
                        items?.length > 0 ? (
                            <>{displayItems?.length > 0 ? (
                                <ul className="w-full h-full flex flex-col gap-2 p-2 pb-20
                                    overflow-y-auto
                                    [&::-webkit-scrollbar]:w-2
                                    [&::-webkit-scrollbar-track]:rounded-full
                                    [&::-webkit-scrollbar-track]:bg-gray-100
                                    [&::-webkit-scrollbar-thumb]:rounded-full
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
                                                                src={`${apiUrl}/barcodes/${item?.barcode}.png`}
                                                                alt="ovida-product-barcode" 
                                                                className="w-[120px] h-[50px] object-contain"
                                                                onError={ev => {
                                                                    ev.target.src='../../public/image-off.png'
                                                                    ev.onerror=null;
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
        </main>
    );
}

export default NewBarcode;