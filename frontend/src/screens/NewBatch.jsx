import { ChevronLeft } from 'lucide-react';
import { useState, useLayoutEffect } from 'react';
import { getData, sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { useNavigate, Link } from 'react-router-dom';
import { toNumber } from '@/utils/number';
import { isValidDate } from '@/utils/datetime';
import { quickSort } from '@/utils/sort';

import AppLogo from '@/components/AppLogo';
import Loading from '@/components/Loading';
import ErrorField from '@/components/ErrorField';

const NewBatch = () => {
    const [data, setData] = useState({batchNo: 0, deliveryRecieptNo: '', deliveryDate: ''});
    const [errorData, setErrorData] = useState({batchNo: '', deliveryRecieptNo: '', deliveryDate: '', default: ''});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const batch = async () => {
        try {
            setLoading(true);

            const batchNo = toNumber(data?.batchNo);
            const deliveryRecieptNo = String(data?.deliveryRecieptNo).trim();
            const deliveryDate = String(data?.deliveryDate).trim();

            if(!batchNo) {
                setErrorData(state => ({...state, batchNo: 'Batch number is required.'}));
                throw new Error('All fields are required.');
            }

            if(deliveryDate) {
                if(!isValidDate(deliveryDate)) {
                    setErrorData(state => ({...state, deliveryDate: 'Date is invalid.'}));
                    throw new Error('Invalid date.');
                }
            }

            const payload = {batchNo, deliveryRecieptNo, deliveryDate};
            const response = await sendJSON(urls.newbatch, payload);
            if(response) {
                navigate('/admin/barcodes');
            }
        } catch(error) {
            console.log(error);
            setErrorData(state => ({...state, default: error?.message}));
        } finally {
            setLoading(false);
        }
    }

    const getBatches = async () => {
        try {
            setLoading(true);
            const response = await getData(urls.getbatches);
            if(response) {
                const data = response?.results;
                // console.log(data);
                const batchesNo = data.map(item => item?.batchNo);
                const sortedNo = quickSort(batchesNo);
                const suggestedBatchNo = sortedNo?.length > 0 ? sortedNo[sortedNo.length-1] + 1 : 1;
                setData(state => ({...state, batchNo: suggestedBatchNo}));
            }
        } catch(error) {
            console.log(error);
            setErrorData(state => ({...state, default: error?.message}));
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        getBatches();
    }, []);

    if(loading) {
        return (
            <Loading customStyle="w-full h-screen" />
        )
    }

    return (
        <div className="w-full min-h-screen py-4 px-4 md:px-10 lg:px-30 xl:px-40">
            <header className="w-full h-[70px] flex items-center mb-2">
                <Link to="/admin" className="md:hidden flex justify-center items-center text-sm">
                    <ChevronLeft />
                    back
                </Link>
                <div className="hidden md:flex">
                    <AppLogo />
                </div>
                <h1 className="md:absolute md:left-1/2 md:-translate-x-1/2 font-bold text-lg md:text-2xl px-4">Create New Batch</h1>
            </header>
            <main className="bg-neutral-100 p-4">    
                <section className="bg-white rounded-md p-4 flex flex-col gap-2">
                    <h3 className="font-bold text-lg">Batch Details</h3>
                    <hr />
                    <div className="flex flex-col sm:px-4 gap-2">
                        <label htmlFor="batch-number" className="font-semibold">
                            Batch Number
                            <span className="text-red-500">*</span>
                        </label>
                        <input 
                            id="batch-number"
                            value={data?.batchNo}
                            onChange={elem => setData(state => ({...state, batchNo: elem.target.value}))}
                            className="max-w-96 outline-none border-2 border-neutral-400 rounded-full py-2 px-4" 
                            placeholder="Batch Number"
                            required
                        />
                        <ErrorField message={errorData?.batchNo || ''} />
                    </div>
                    <div className="flex flex-col sm:px-4 gap-2">
                        <label htmlFor="delivery-reciept_no" className="font-semibold">Delivery Reciept Number</label>
                        <input 
                            id="delivery-reciept_no"
                            value={data?.deliveryRecieptNo}
                            onChange={elem => {
                                const input = elem.target.value;
                                const nInput = input.replace(/[^0-9]+/g, '');
                                setData(state => ({...state, deliveryRecieptNo: nInput}));
                            }}
                            className="max-w-96 outline-none border-2 border-neutral-400 rounded-full py-2 px-4" 
                            placeholder="Delivery Reciept Number"
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
                            className="max-w-96 outline-none border-2 border-neutral-400 rounded-full py-2 px-4"
                            required
                        />
                        <ErrorField message={errorData?.deliveryDate || ''} />
                    </div>
                    <div className="sm:px-4 sm:py-2 flex gap-2">
                        <Link 
                            to="/admin/barcodes" 
                            className="flex items-center justify-center leading-none font-bold rounded-full p-4 text-white bg-gray-500 hover:bg-gray-600"
                        >
                            Cancel
                        </Link>
                        <button 
                            onClick={batch} 
                            className="flex items-center justify-center leading-none bg-green-600 text-white font-bold rounded-full p-4 hover:bg-green-800"
                        >
                            Add Batch
                        </button>
                    </div>
                    <ErrorField message={errorData?.default || ''} />
                </section>
            </main>
        </div>
    )
}

export default NewBatch;