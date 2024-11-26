import { Link } from 'react-router-dom';
import { Plus, Pencil } from 'lucide-react';
import { useLayoutEffect, useState } from 'react';
import { urls } from '@/constants/urls';
import { getData } from '@/utils/send';

import Loading from '@/components/Loading';
import Select from '@/components/DropDown';

const Barcode = () => {
    const [selectedBatchNo, setSelectedBatchNo] = useState(null);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);

    const selectBatch = (batchNo) => {
        setSelectedBatchNo(batchNo);
    }

    const getBatches = async () => {
        try {
            setLoading(true);
            const response = await getData(urls.getbatches);
            if(response) {
                const data = response?.results;
                console.log(data);
                setBatches(data);
            }
        } catch(error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        getBatches();
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
            <section className="flex justify-between items-center gap-4">
                <h1 className="hidden sm:flex font-semibold text-lg">Barcodes</h1>
                <div className="flex gap-2">
                    <Link
                        to={`/admin/update-batch/${selectedBatchNo}`}
                        className={`flex gap-2 items-center justify-center leading-none bg-green-600 text-white font-bold rounded-full p-2 sm:px-4 hover:bg-green-800 ${!selectedBatchNo ? 'pointer-events-none opacity-50' : ''}`}
                    >
                        <Pencil size={20} />
                        <span className="hidden sm:flex text-nowrap">Edit Batch</span>
                    </Link>
                    <Link
                        to="/admin/new-batch"
                        className="flex gap-2 items-center justify-center leading-none bg-green-600 text-white font-bold rounded-full p-2 sm:pr-4 hover:bg-green-800"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:flex text-nowrap">New Batch</span>
                    </Link>
                </div>
            </section>
            <section>
                <h1 className="flex sm:hidden font-semibold text-lg">Barcodes</h1>
            </section>
            <section className="grow w-full h-full relative">
                <div className="w-full absolute top-0 left-0 right-0 bottom-0 bg-white mt-2 rounded-lg shadow-md overflow-hidden">
                    <div className="h-[60px] border-b p-2 flex gap-2">
                        <Select name="Select Batch Number" className="w-fit h-full py-2 rounded-lg border-2 border-neutral-400 z-50">
                            {
                                batches.map((item, index) => {
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => selectBatch(item?.batchNo)}
                                            className="text-nowrap text-[16px] p-2 px-4 rounded-lg hover:bg-gray-200 overflow-x-hidden text-ellipsis flex gap-2 items-center"
                                        >
                                            Batch {item?.batchNo}
                                        </button>
                                    )
                                })
                            }
                        </Select>
                        {selectedBatchNo && <span className="bg-green-400/50 p-2 rounded-md">Batch {selectedBatchNo}</span>}
                    </div>
                    {/* container with scroll bar */}

                </div>
            </section>
        </main>
    )
}

export default Barcode;