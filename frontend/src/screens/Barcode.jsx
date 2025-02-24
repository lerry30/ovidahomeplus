import { Link, useNavigate } from 'react-router-dom';
import { ErrorModal, Prompt } from '@/components/Modal';
import { Plus, Pencil, Printer, ChevronLeft, ChevronRight, Trash2, AlignJustify, ListOrdered } from 'lucide-react';
import { useLayoutEffect, useState, useRef } from 'react';
import { urls, apiUrl } from '@/constants/urls';
import { getData, sendJSON } from '@/utils/send';
import { formattedNumber } from '@/utils/number';
import { zBatch } from '@/store/batch';

import Loading from '@/components/Loading';
import Calendar from '@/components/Calendar';

import Select, {SelectButton} from '@/components/DropDown';

const Barcode = () => {
    const batchId = zBatch(state => state?.id);
    const batchDate = zBatch(state => state?.date);

    const [selectedYear, setSelectedYear] = useState(null);
    // holds data of selected batch
    const [selectedBatchId, setSelectedBatchId] = useState(null);
    const [supplierId, setSupplierId] = useState(null);
    const [supplierName, setSupplierName] = useState('');
    const [selectedBatchNo, setSelectedBatchNo] = useState(null);
    const [selectedBatchDate, setSelectedBatchDate] = useState(null);

    const [selectedBatchStatus, setSelectedBatchStatus] = useState('No Batch Selected'); // default message for empty list
    const [batches, setBatches] = useState([]); // all batches
    const [displayedBatches, setDisplayedBatches] = useState([]); // dropdown list of batches based on selected date
    const [batchItems, setBatchItems] = useState([]); // contains items which displayed on screen
    const [printerError, setPrinterError] = useState(false);
    const [pageOffset, setPageOffset] = useState(1); // pagination's index
    const [deletePrompt, setDeletePrompt] = useState({header: '', message: ''});
    const [loading, setLoading] = useState(false);

    const [isCompact, setIsCompact] = useState(false); // is compact the displayed items
    const [totalItems, setTotalItems] = useState(0);
    const [totalSoldItems, setTotalSoldItems] = useState(0);

    const batchTrigger = useRef(false); // trigger to save data of selected batch in store and localstorage
    const barcodeIdToDelete = useRef(null); // selected item's id

    const navigate = useNavigate();
    const today = new Date();

    const PAGINATE_NO = 5;

    const textToPrint = (item) => {
        const itemCodeText = `ITEM CODE: ${item?.itemCode}`;
        const srpText = `SRP: ${formattedNumber(item?.srp)}`;
        const deliveryInfo = `SUPPLIER: ${item?.supplierName} - Batch #${selectedBatchNo} - ${selectedBatchDate}`;
        return `${item?.productTypeName}>${item?.description}>${itemCodeText}>${deliveryInfo}>${srpText}`;
    }

    const sendDataToPrint = async (items) => {
        try {
            setLoading(true);
            const dataset = [];
            for(const item of items) {
                if(item?.disabledNote) continue;
                for(const barcodeData of item?.barcodes) {
                    if(barcodeData?.isSold) continue;
                    const text = textToPrint(item);
                    const barcode = barcodeData?.barcode;
                    dataset.push({barcodeData: barcode, text});
                }
            }

            const payload = {dataset};
            const response = await sendJSON(
                'http://localhost:8080/local/api/barcodes/printall',
                payload
            );
        } catch(error) {
            console.log('Printer Error');
            setPrinterError(true);
        } finally {
            setLoading(false);
        }
    }

    const printItemBarcodes = async (item) => {
        if(!item) 
            throw new Error('Print Barcode: Data to print is not defined.');
        sendDataToPrint([item]);
    }

    const printAllBarcodes = async () => {
        if(batchItems?.length === 0) 
            throw new Error('Print All: Data to print is not defined.');
        sendDataToPrint(batchItems);
    }

    const printBarcode = async (barcodeData, text) => {
        try {
            setLoading(true);
            if(!barcodeData || !text) throw new Error('Data to print is not defined.');

            const payload = {barcodeData, text};
            const response = await sendJSON(
                'http://localhost:8080/local/api/barcodes/print', 
                payload
            );
        } catch(error) {
            console.log('Printer Error');
            setPrinterError(true);
        } finally {
            setLoading(false);
        }
    }

    // To display items and the number of barcodes for each.
    // It is for eas of analizing their numbers. 
    const orgList = async () => {
        try {
            setLoading(true);

            const payload = {batchId: selectedBatchId, limit: PAGINATE_NO, offset: pageOffset};
            const response = await sendJSON(urls.getnumberofbarcodes, payload);
            if(response) {
                const data = response.results;
                setBatchItems(data);
                setIsCompact(true);
            }
        } catch(error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    // to redisplay the items
    const setDefaultList = () => {
        const batchSelected = batches.find(item => item.batchId===selectedBatchId);
        selectBatch(batchSelected);
    }

    const deleteItem = async () => {
        try {
            setLoading(true);

            const payload = {id: barcodeIdToDelete.current};
            const response = await sendJSON(urls.deletebarcode, payload, 'DELETE');
            if(response) {
                setDeletePrompt({header: '', message: ''});
                setDefaultList();
            }
        } catch(error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const saveBatchInfo = () => {
        zBatch.getState()?.saveBatchData(
            selectedBatchId, 
            supplierId, 
            supplierName, 
            selectedBatchNo, 
            selectedBatchDate
        );
    }

    const selectBatch = async (batch) => {
        try {
            setLoading(true);
            
            const batchId = batch?.batchId;
            const batchNo = batch?.batchNo;
            const deliveryDate = batch?.deliveryDate;

            setSelectedBatchId(batchId);
            setSelectedBatchNo(batchNo);
            setSelectedBatchDate(deliveryDate);
            setSupplierId(batch?.supplierId);
            setSupplierName(batch?.supplierName);

            const payload = {batchId, limit: PAGINATE_NO, offset: pageOffset};
            const response = await sendJSON(urls.batchdata, payload);
            if(response) {
                const data = response?.results;
                const total = response?.totalItems;
                const sold = response?.totalSoldItems
                //console.log(data);
                setBatchItems(data);

                setTotalItems(total);
                setTotalSoldItems(sold);

                if(data?.length <= 0) setSelectedBatchStatus('Empty Batch Items');
            }
        } catch(error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    const selectDate = (date) => {
        const nBatches = [];
        for(const batch of batches) {
            if(batch?.deliveryDate === date) {
                nBatches.push(batch);
            }
        }

        if(nBatches?.length === 0) {
            navigate('/admin/new-batch');
        }

        setDisplayedBatches(nBatches);
        setBatchItems([]); // displayed items to be cleared when new date is selected

        setSelectedBatchId(null);
        setSelectedBatchNo(null);
        setSelectedBatchDate(null);
        setSupplierId(null);
        setSupplierName(null);
    }

    const getBatches = async () => {
        try {
            setLoading(true);
            const response = await getData(urls.getbatches);
            if(response) {
                const data = response?.results?.reverse();
                //console.log(data);
                setBatches(data);
            }
        } catch(error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        setTimeout(() => {
            setPrinterError(false);
        }, 1000);
    }, [printerError]);

    useLayoutEffect(() => {
        if(batches.length > 0) {
            // to help pagination button to identify
            // which item display format to display
            if(!isCompact) {
                setDefaultList();
            } else {
                orgList();
            }
        }
    }, [pageOffset]);

    useLayoutEffect(() => {
        if(batchTrigger.current)
            saveBatchInfo();
    }, [batchTrigger.current]);

    // redisplay items on load
    useLayoutEffect(() => {
        if(batches.length > 0) {
            const batchSelected = batches.find(item => item.batchId===batchId);
            const listOfBatches = batches.filter(item => item.deliveryDate===batchDate);
            selectBatch(batchSelected);
            setDisplayedBatches(listOfBatches);
        }
    }, [batches]);

    useLayoutEffect(() => {
        getBatches();
        zBatch.getState().reloadBatchData();
    }, []);

    const PrintNAddItemButtons = ({className}) => (
        <div className={`flex gap-2 ${className}`}>
            <button
                onClick={printAllBarcodes}
                className={`flex gap-2 items-center justify-center leading-none bg-green-600 text-white font-bold rounded-lg p-2 sm:px-4 hover:bg-green-800 ${!selectedBatchNo ? 'pointer-events-none opacity-50' : ''}`}
            >
                <Printer />
                <span className="hidden md:flex">Print All Barcodes</span>
            </button>
            <button
                onClick={() => {
                    saveBatchInfo();
                    navigate('/admin/new-barcode');
                }}
                className={`flex gap-2 items-center justify-center leading-none bg-green-600 text-white font-bold rounded-lg p-2 sm:px-4 hover:bg-green-800 ${!selectedBatchNo ? 'pointer-events-none opacity-70' : ''}`}
            >
                <Plus size={20} />
                <span className="hidden sm:flex text-nowrap">New Item</span>
            </button>
        </div>
    );

    const CompactList = ({item}) => {
        const soldItems = item?.barcodes?.filter(barcode => barcode?.isSold===1); // get sold items
        const noOfSoldItems = soldItems?.length;
        const noOfItems = item?.barcodes?.length ?? 0;
        const quantity = Math.max(0, noOfItems-noOfSoldItems);
        return (
            <div className="h-[420px] md:h-[320px] lg:h-fit flex flex-col sm:flex-row p-1 pb-2 border rounded-lg">
                <img
                    src={`${apiUrl}/fl/items/${item?.image}`}
                    alt="ovida-product" 
                    className="w-[80px] h-[80px] object-contain rounded-lg border mb-4"
                    onError={ev => {
                        // just for dev and production to prevent error
                        ev.target.src='/image-off.png';
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
                        </div>
                        <p className="text-[12px]">{item?.description}</p>
                        <p className="text-[12px]">Item Code:&nbsp;&nbsp;{item?.itemCode}</p>
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
                    <div className="w-full flex flex-col 
                        row-start-2 lg:row-start-1 lg:col-start-3">
                        <article>
                            <span>Quantity:&nbsp;&nbsp;</span>
                            <span className="font-semibold">
                                {quantity}
                            </span>
                        </article>
                        <article>
                            <span>Sold Items:&nbsp;&nbsp;</span>
                            <span className="font-semibold">
                                {noOfSoldItems}
                            </span>
                        </article>
                    </div>
                    <div className="flex flex-col items-end gap-1 md:justify-start
                        row-start-1 col-start-2 lg:col-start-4">
                        <button
                            onClick={() => {
                                //const text = textToPrint(item);
                                printItemBarcodes(item);
                            }}
                            className={`flex gap-2 items-center justify-center leading-none bg-green-600 text-white font-bold rounded-lg p-2 sm:px-4 hover:bg-green-800 ${!selectedBatchNo ? 'pointer-events-none opacity-50' : ''}`}
                        >
                            <Printer />
                            <span className="hidden sm:flex text-nowrap">Print</span>
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if(deletePrompt?.header || deletePrompt?.message) {
        return (
            <Prompt 
                header={deletePrompt?.header}
                message={deletePrompt?.message} 
                callback={deleteItem} 
                onClose={() => setDeletePrompt({header: '', message: ''})} 
            />
        )
    }

    if(printerError) {
        return (
            <ErrorModal
                header="Printer Error" 
                message="Printer not found."
            />
        )
    }

    if (loading) {
        return (
            <Loading customStyle="w-full h-screen" />
        )
    }

    return (
        <main className="absolute top-0 
            left-admin-sidebar-sm lg:left-admin-sidebar-lg 
            w-[calc(100vw-var(--admin-sidebar-width-sm))] lg:w-[calc(100vw-var(--admin-sidebar-width-lg))]
            h-full md:h-screen bg-neutral-100 p-2 sm:p-4
            flex flex-col
        ">
            <section className="flex justify-between items-center gap-4">
                <h1 className="hidden sm:flex font-semibold text-lg">Barcodes</h1>
                <div className="flex gap-2">
                    <Link
                        to={`/admin/update-batch/${selectedBatchId}`}
                        className={`flex gap-2 items-center justify-center leading-none bg-[#e37400] text-white font-bold rounded-lg p-2 sm:px-4 hover:bg-[#d37506] ${!selectedBatchNo ? 'pointer-events-none opacity-70' : ''}`}
                    >
                        <Pencil size={20} />
                        <span className="hidden sm:flex text-nowrap">Edit Batch</span>
                    </Link>
                    <Link
                        to="/admin/new-batch"
                        className="flex gap-2 items-center justify-center leading-none bg-[#e37400] text-white font-bold rounded-lg p-2 sm:pr-4 hover:bg-[#d37506]"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:flex text-nowrap">New Batch</span>
                    </Link>
                </div>
                {/* buttons for print all and add item for responsiveness */}
                <PrintNAddItemButtons className="flex sm:hidden" />
            </section>
            <section>
                <h1 className="flex sm:hidden font-semibold text-lg">Barcodes</h1>
            </section>
            <section className="grow w-full h-full relative">
                <div className="w-full absolute top-0 left-0 right-0 bottom-0 bg-white mt-2 rounded-lg shadow-md overflow-hidden">
                    <div className="h-[110px] sm:h-[60px] border-b p-2 flex justify-between items-center">
                        <div className="flex flex-wrap items-center gap-2">
                            <Select 
                                name={`${selectedYear ? selectedYear : 'Select Year'}`}
                                className="h-full py-2 rounded-lg border-2 border-neutral-400 z-50">
                                {
                                    Array(today.getFullYear()-2024+1).fill(0).map((_, index) => {
                                        const text = index + 2024;
                                        return (
                                            <SelectButton 
                                                key={index}
                                                text={text}
                                                onClick={() => setSelectedYear(text)}
                                            />
                                        )
                                    })
                                }
                            </Select>
                            {selectedYear && (
                                <Calendar 
                                    year={selectedYear}
                                    callback={selectDate}
                                    highlight={
                                        batches.reduce((object, batch) => {
                                            if(!batch) return object;
                                            const nBatch = `${batch?.supplierName} Batch ${batch?.batchNo}`;
                                            const prevBatch = object[batch?.deliveryDate] || [];
                                            const nArray = [...prevBatch, nBatch];
                                            return {...object, [batch?.deliveryDate]: nArray};
                                        }, {})
                                    }
                                />
                            )}
                            {displayedBatches?.length > 0 && (
                                <Select
                                    name={`${selectedBatchNo ? 
                                            `Batch ${selectedBatchNo}` 
                                        : 'Select Batch Number'}`} 
                                    className="w-fit h-full py-2 rounded-lg border-2 border-neutral-400 z-50">
                                    {
                                        displayedBatches.map((item, index) => {
                                            return (
                                                <SelectButton
                                                    key={index}
                                                    text={`${item?.supplierName} Batch ${item?.batchNo}${item?.deliveryDate ? ` - ${item?.deliveryDate}` : ''}`}
                                                    onClick={() => {
                                                        selectBatch(item);
                                                        batchTrigger.current = true;
                                                    }}
                                                />
                                            )
                                        })
                                    }
                                </Select>
                            )}
                            {(selectedBatchNo && selectedBatchDate && supplierName) && (
                                <span className="hidden lg:flex bg-green-400/50 p-2 rounded-md">
                                    {supplierName} Batch {selectedBatchNo}{selectedBatchDate ? ` - ${selectedBatchDate}` : ''}
                                </span>
                            )}
                        </div>
                        {/* buttons for print all and add item for responsiveness */}
                        <PrintNAddItemButtons className="hidden sm:flex" />
                    </div>
                    <div className="h-[40px] flex justify-between border-b p-2 sm:px-4">
                        {batchItems?.length > 0 && (
                            <div className="h-full flex gap-3">
                                <button 
                                    className={`border rounded-md ${!isCompact && 'text-green-700'}`}
                                    onClick={() => {
                                        setDefaultList();
                                        setIsCompact(false);
                                    }}>
                                    <AlignJustify />
                                </button>
                                <button 
                                    className={`border rounded-md ${isCompact && 'text-green-700'}`}
                                    onClick={orgList}>
                                    <ListOrdered />
                                </button>
                                <div className="flex gap-2 border border-neutral-300 rounded-md px-2">
                                    <article className="font-semibold">
                                        <span className="mr-1">Total Items:</span>
                                        <span>{totalItems}</span>
                                    </article>
                                    <article className="font-semibold
                                        border-l-2 border-neutral-300 pl-2">
                                        <span className="mr-1">Sold Items:</span>
                                        <span>{totalSoldItems}</span>
                                    </article>
                                </div>
                            </div>
                        )}
                        <div className="h-full flex md:gap-2 ml-auto">
                            <button
                                onClick={() => setPageOffset(Math.max(pageOffset-1, 1))}
                                className="flex">
                                <ChevronLeft />
                            </button>
                            <span>{pageOffset}</span>
                            <button 
                                onClick={() => setPageOffset(pageOffset+1)}
                                className="flex">
                                <ChevronRight />
                            </button>
                        </div>
                    </div>
                    {batchItems?.length <= 0 && (
                        <div className="absolute top-[100px] left-0 right-0 bottom-0 z-[0] flex justify-center items-center">
                            <h3>{selectedBatchStatus}</h3>
                        </div>
                    )}
                    {/* container with scroll bar */}
                    <ul className="w-full h-full p-2 flex flex-col gap-2 pb-32
                        overflow-y-auto
                        [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-track]:rounded-lg
                        [&::-webkit-scrollbar-track]:bg-gray-100
                        [&::-webkit-scrollbar-thumb]:rounded-lg
                        [&::-webkit-scrollbar-thumb]:bg-gray-300">
                        {batchItems?.map((item, index) => {
                            const isActive = !item?.disabledNote;
                            return (
                                <li 
                                    key={index}
                                    className="flex flex-col gap-2"
                                >
                                    {!isCompact ?
                                        item?.barcodes?.map((barcode, brIndex) => {
                                            return (
                                                <div key={brIndex}>
                                                    <div className={`h-[420px] md:h-[320px] lg:h-fit flex flex-col sm:flex-row p-1 pb-2 border rounded-lg 
                                                        ${isActive ? 'border-neutral-300' : 'border-red-600 bg-gray-200/50'}
                                                        ${!!barcode?.isSold ? 'bg-red-200' : 'bg-white'}`}>
                                                        <img 
                                                            src={`${apiUrl}/fl/items/${item?.image}`}
                                                            alt="ovida-product" 
                                                            className="w-[80px] h-[80px] object-contain rounded-lg border mb-4"
                                                            onError={ev => {
                                                                // just for dev and production to prevent error
                                                                ev.target.src='/image-off.png';
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
                                                                </div>
                                                                <p className="text-[12px]">{item?.description}</p>
                                                                <p className="text-[12px]">Item Code:&nbsp;&nbsp;{item?.itemCode}</p>
                                                                {/* -------------------------------------------------- */}
                                                                {/* display only for small screen */}
                                                                {/* <p className="flex md:hidden text-[12px]">
                                                                    {formattedDateAndTime(new Date(item?.deliveryDate))}
                                                                </p> */}
                                                                {!isActive && (
                                                                    <p className="text-red-500 font-semibold italic text-[14px]">
                                                                        Inactive item: Note - {item?.disabledNote}
                                                                    </p>
                                                                )}
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
                                                                    src={`${apiUrl}/fl/barcodes/${barcode?.barcode}.png`}
                                                                    alt="ovida-product-barcode" 
                                                                    className="w-[124px] h-[50px] object-contain"
                                                                    onError={ev => {
                                                                        // just for dev and production to prevent error
                                                                        ev.target.src='/image-off.png';
                                                                        ev.onerror=null; // prevents infinite loop
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1 md:justify-start
                                                                row-start-1 col-start-2 lg:col-start-4">
                                                                {!!barcode?.isSold ?
                                                                    <span className="bg-red-600 text-white px-2 rounded-lg font-semibold">
                                                                        Sold
                                                                    </span>
                                                                :
                                                                    isActive && (
                                                                        <button
                                                                            onClick={() => {
                                                                                const text = textToPrint(item);
                                                                                printBarcode(barcode?.barcode, text);
                                                                            }}
                                                                            className={`flex gap-2 items-center justify-center leading-none bg-green-600 text-white font-bold rounded-lg p-2 sm:px-4 hover:bg-green-800 ${!selectedBatchNo ? 'pointer-events-none opacity-50' : ''}`}
                                                                        >
                                                                            <Printer />
                                                                            <span className="hidden sm:flex text-nowrap">Print Barcode</span>
                                                                        </button>
                                                                    )
                                                                }
                                                                {!barcode?.isSold && (
                                                                    <button
                                                                        onClick={() => {
                                                                            barcodeIdToDelete.current = barcode?.id;
                                                                            setDeletePrompt({header: 'Remove Item', message: 'Are you sure you want to remove the item?'});
                                                                        }}
                                                                        className={`flex gap-2 items-center justify-center leading-none bg-red-600 text-white font-bold rounded-lg p-2 sm:px-4 hover:bg-red-700 ${!selectedBatchNo ? 'pointer-events-none opacity-50' : ''}`}
                                                                    >
                                                                        <Trash2 />
                                                                        <span className="hidden sm:flex text-nowrap">Remove</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        )
                                    :
                                        <CompactList item={item} />    
                                    }
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </section>
        </main>
    )
}

export default Barcode;
