import { Link, useNavigate } from 'react-router-dom';
import { ErrorModal } from '@/components/Modal';
import { Plus, Pencil, Printer } from 'lucide-react';
import { useLayoutEffect, useState, useRef } from 'react';
import { urls, apiUrl } from '@/constants/urls';
import { getData, sendJSON } from '@/utils/send';
import { formattedNumber, toNumber } from '@/utils/number';
import { zBatch } from '@/store/batch';

import Loading from '@/components/Loading';
import Select from '@/components/DropDown';
import Calendar from '@/components/Calendar';

const Barcode = () => {
    const batchId = zBatch(state => state?.id);
    const batchDate = zBatch(state => state?.date);

    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedBatchId, setSelectedBatchId] = useState(null);
    const [supplierId, setSupplierId] = useState(null);
    const [supplierName, setSupplierName] = useState('');
    const [selectedBatchNo, setSelectedBatchNo] = useState(null);
    const [selectedBatchDate, setSelectedBatchDate] = useState(null);
    const [selectedBatchStatus, setSelectedBatchStatus] = useState('No Batch Selected');
    const [batches, setBatches] = useState([]);
    const [displayedBatches, setDisplayedBatches] = useState([]);
    const [batchItems, setBatchItems] = useState([]);
    const [printerError, setPrinterError] = useState(false);
    const [loading, setLoading] = useState(false);

    const batchTrigger = useRef(false);

    const navigate = useNavigate();
    const today = new Date();

    const textToPrint = (item) => {
        const itemCodeText = `ITEM CODE: ${item?.itemCode}`;
        const srpText = `SRP: ${formattedNumber(item?.srp)}`;
        const deliveryInfo = `SUPPLIER ${item?.supplierName} - Batch #${selectedBatchNo} - ${selectedBatchDate}`;
        return `${item?.productTypeName}>${item?.description}>${itemCodeText}>${deliveryInfo}>${srpText}`;
    }

    const printAllBarcodes = async () => {
        try {
            setLoading(true);
            if(batchItems?.length === 0) throw new Error('Print All: Data to print is not defined.');
            const dataset = [];
            for(const item of batchItems) {
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

            const payload = {batchId};
            const response = await sendJSON(urls.batchdata, payload);
            if(response) {
                const data = response?.results;
                // console.log(data);
                setBatchItems(data);
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
        setDisplayedBatches(nBatches);
        setBatchItems([]);
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
                                    Array(2025-today.getFullYear()+1).fill(0).map((_, index) => {
                                        const text = index + 2025;
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedYear(text)}
                                                className="text-nowrap text-[16px] p-2 px-4 rounded-lg hover:bg-gray-200 overflow-x-hidden text-ellipsis flex gap-2 items-center"
                                            >
                                                {text}
                                            </button>
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
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        selectBatch(item);
                                                        batchTrigger.current = true;
                                                    }}
                                                    className="text-nowrap text-[16px] p-2 sm:px-4 rounded-lg hover:bg-gray-200 overflow-x-hidden text-ellipsis flex gap-2 items-center"
                                                >
                                                    {item?.supplierName} Batch {item?.batchNo}{item?.deliveryDate ? ` - ${item?.deliveryDate}` : ''}
                                                </button>
                                            )
                                        })
                                    }
                                </Select>
                            )}
                            {/* {selectedBatchNo && <span className="bg-green-400/50 p-2 rounded-md">
                                Batch {selectedBatchNo}{selectedBatchDate ? ` - ${selectedBatchDate}` : ''}
                            </span>} */}
                        </div>
                        {/* buttons for print all and add item for responsiveness */}
                        <PrintNAddItemButtons className="hidden sm:flex" />
                    </div>
                    {batchItems?.length <= 0 && (
                        <div className="absolute top-[60px] left-0 right-0 bottom-0 z-[0] flex justify-center items-center">
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
                                    {item?.barcodes?.map(barcode => {
                                        return (
                                            <div key={barcode?.id}>
                                                <div className={`h-[420px] md:h-[320px] lg:h-fit flex flex-col sm:flex-row p-1 pb-2 border rounded-lg 
                                                    ${isActive ? 'border-neutral-300' : 'border-red-600 bg-gray-200/50'}
                                                    ${!!barcode?.isSold ? 'bg-red-200' : 'bg-white'}`}>
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
                                                                    ev.target.src=`${apiUrl}/image-off.png`
                                                                    ev.onerror=null; // prevents infinite loop
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex flex-col items-end md:justify-start
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
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    )}
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
