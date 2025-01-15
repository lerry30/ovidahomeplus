import { ChevronLeft } from 'lucide-react';
import { useState, useLayoutEffect } from 'react';
import { getData, sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toNumber } from '@/utils/number';
import { isValidDate, formattedDate } from '@/utils/datetime';
import { quickSort } from '@/utils/sort';

import AppLogo from '@/components/AppLogo';
import SidebarLayout from '@/components/Sidebar';
import Loading from '@/components/Loading';
import ErrorField from '@/components/ErrorField';
import Select from '@/components/DropDown';

const UpdateBatch = () => {
    const [data, setData] = useState({supplierId: 0, batchNo: 0, deliveryReceiptNo: '', deliveryDate: ''});
    const [errorData, setErrorData] = useState({supplier: '', batchNo: '', deliveryReceiptNo: '', deliveryDate: '', default: ''});
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const today = new Date();

    const batchId = useParams()?.batch;

    const batch = async () => {
        try {
            setLoading(true);

            const supplierId = toNumber(data?.supplierId);
            const batchNo = toNumber(data?.batchNo);
            const deliveryReceiptNo = String(data?.deliveryReceiptNo).trim();
            const deliveryDate = String(data?.deliveryDate).trim();

            if(!supplierId) {
                setErrorData(state => ({...state, supplier: 'Supplier is required. Please select a supplier from the dropdown.'}));
                throw new Error('All fields are required.');
            }

            if(!batchNo) {
                setErrorData(state => ({...state, batchNo: 'Batch number is required.'}));
                throw new Error('All fields are required.');
            }

            if(!deliveryDate) {
                setErrorData(state => ({...state, deliveryDate: 'Delivery date is required.'}));
                throw new Error('All fields are required.');
            }

            if(deliveryDate) {
                if(!isValidDate(deliveryDate)) {
                    setErrorData(state => ({...state, deliveryDate: 'Date is invalid.'}));
                    throw new Error('Invalid date.');
                }
            }

            const payload = {batchId, supplierId, batchNo, deliveryReceiptNo, deliveryDate};
            const response = await sendJSON(urls.updatebatch, payload, 'PUT');
            if(response) {
                navigate(`/admin/barcodes/${batchNo}`);
            }
        } catch(error) {
            console.log(error);
            setErrorData(state => ({...state, default: error?.message}));
        } finally {
            setLoading(false);
        }
    }

    const getSuppliers = async () => {
        try {
            setLoading(true);
            const response = await getData(urls?.getsuppliers);
            if(response) {
                //console.log(response?.result);
                const data = response?.results || [];
                setSuppliers(data);
            }
        } catch(error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const getBatchData = async () => {
        try {
            setLoading(true);

            const payload = {batchId};
            const response = await sendJSON(urls.getbatch, payload);
            if(response) {
                const data = response?.results;
                //console.log(data);
                setSelectedSupplier(data?.supplierName);
                setData({
                    supplierId: data?.supplierId, 
                    batchNo: data?.batchNo,
                    deliveryReceiptNo: data?.deliveryReceiptNo,
                    deliveryDate: data?.deliveryDate
                });
            }
        } catch(error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        getBatchData();
    }, [batchId]);

    useLayoutEffect(() => {
        getSuppliers();
        setData(state => ({...state, deliveryDate: formattedDate(today)}));
    }, []);

    if(loading) {
        return (
            <Loading customStyle="w-full h-screen" />
        )
    }

        /*<div className="w-full min-h-screen py-4 px-4 md:px-10 lg:px-30 xl:px-40">
            <header className="w-full h-[70px] flex items-center mb-2">
                <Link to="/admin/barcodes/0" className="md:hidden flex justify-center items-center text-sm">
                    <ChevronLeft />
                    back
                </Link>
                <div className="hidden md:flex">
                    <AppLogo segment="/barcodes/0" />
                </div>
                <h1 className="md:absolute md:left-1/2 md:-translate-x-1/2 font-bold text-lg md:text-2xl px-4">Create New Batch</h1>
            </header>*/
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
                    <h1 className="font-semibold text-lg pl-1">
                        Update Batch
                    </h1>
                </header>
                <div className="h-full bg-neutral-100">
                    <section className="h-full bg-white rounded-md p-4 flex flex-col gap-2">
                        <h3 className="font-bold text-lg">Batch Details</h3>
                        <hr />
                        <div className="flex flex-col sm:px-4 gap-2">
                            <h3 className="font-semibold">
                                Supplier
                                <span className="text-red-500">*</span>
                            </h3>
                            <div className="flex items-center gap-4">
                                <Select 
                                    name={`${selectedSupplier ? selectedSupplier : 'Select Supplier'}`}
                                    className="w-fit py-2 max-h-[40px] rounded-lg border-2 border-neutral-400 z-20"
                                >
                                    {
                                        suppliers.map((item, index) => {
                                            if(item?.status !== 'active') return null;
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        setData(state => ({...state, supplierId: item?.id}));
                                                        setSelectedSupplier(item?.name);
                                                    }}
                                                    className="text-nowrap text-[16px] p-2 px-4 rounded-lg hover:bg-gray-200 overflow-x-hidden text-ellipsis flex gap-2 items-center"
                                                >
                                                    {item?.name}
                                                </button>
                                            )
                                        })
                                    }
                                </Select>
                                {/* Dropdown output */}
                                {selectedSupplier && (
                                    <span 
                                        className="hidden sm:flex 
                                        bg-green-400/50 p-2 rounded-md"
                                    >
                                        {selectedSupplier}
                                    </span>
                                )}
                            </div>
                            <ErrorField message={errorData?.supplier || ''} />
                        </div>
                        <div className="flex flex-col sm:px-4 gap-2">
                            <label htmlFor="batch-number" className="font-semibold">
                                Batch Number
                                <span className="text-red-500">*</span>
                            </label>
                            <input 
                                id="batch-number"
                                value={data?.batchNo}
                                onChange={elem => setData(state => ({...state, batchNo: elem.target.value}))}
                                className="max-w-96 outline-none border-2 border-neutral-400 rounded-lg py-2 px-4" 
                                placeholder="Batch Number"
                                required
                            />
                            <ErrorField message={errorData?.batchNo || ''} />
                        </div>
                        <div className="flex flex-col sm:px-4 gap-2">
                            <label htmlFor="delivery-receipt_no" className="font-semibold">Delivery Receipt Number</label>
                            <input 
                                id="delivery-receipt_no"
                                value={data?.deliveryReceiptNo ?? ''}
                                onChange={elem => {
                                    const input = elem.target.value;
                                    const nInput = input.replace(/[^0-9]+/g, '');
                                    setData(state => ({...state, deliveryReceiptNo: nInput}));
                                }}
                                className="max-w-96 outline-none border-2 border-neutral-400 rounded-lg py-2 px-4" 
                                placeholder="Delivery Receipt Number"
                            />
                        </div>
                        <div className="w-1/2 flex flex-col sm:px-4 gap-2">
                            <label htmlFor="delivery-date" className="font-semibold">
                                Delivery Date
                            </label>
                            <input 
                                id="delivery-date"
                                type="date"
                                value={data?.deliveryDate}
                                onChange={elem => {
                                    const input = elem.target.value;
                                    setData(state => ({...state, deliveryDate: input}))
                                }}
                                className="max-w-96 outline-none border-2 border-neutral-400 rounded-lg py-2 px-4"
                                required
                            />
                            <ErrorField message={errorData?.deliveryDate || ''} />
                        </div>
                        <div className="sm:px-4 sm:py-2 flex gap-2">
                            <Link 
                                to="/admin/barcodes/0"
                                className="flex items-center justify-center leading-none font-bold rounded-lg p-4 text-white bg-gray-500 hover:bg-gray-600"
                            >
                                Cancel
                            </Link>
                            <button 
                                onClick={batch} 
                                className="flex items-center justify-center leading-none bg-green-600 text-white font-bold rounded-lg p-4 hover:bg-green-800"
                            >
                                Update Batch
                            </button>
                        </div>
                        <ErrorField message={errorData?.default || ''} />
                    </section>
                </div>
            </main>
        </div>
    )
}

export default UpdateBatch;
