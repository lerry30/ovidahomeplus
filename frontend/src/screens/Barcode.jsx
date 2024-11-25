import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useLayoutEffect, useState } from 'react';
import { urls } from '@/constants/urls';
import { getData } from '@/utils/send';

import Loading from '@/components/Loading';
import Select from '@/components/DropDown';

const Barcode = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);

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
                <Link
                    to="/admin/new-batch"
                    className="flex gap-2 items-center justify-center leading-none bg-green-600 text-white font-bold rounded-full p-2 sm:pr-4 hover:bg-green-800"
                >
                    <Plus />
                    <span className="hidden sm:flex text-nowrap">New Batch</span>
                </Link>
            </section>
            <section>
                <h1 className="flex sm:hidden font-semibold text-lg">Barcodes</h1>
            </section>
            <section className="grow w-full h-full relative">
                {/* container with scroll bar */}
                <div className="w-full absolute top-0 left-0 right-0 bottom-0 bg-white mt-2 rounded-lg shadow-md overflow-hidden">
                    <div className="h-[60px] border-b p-2 flex gap-2">
                        <Select name="Select Batch Number" className="w-fit py-2 max-h-[40px] rounded-lg border-2 border-neutral-400 z-50">
                            {
                                batches.map((item, index) => {
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => {}}
                                            className="text-nowrap text-[16px] p-2 px-4 rounded-lg hover:bg-gray-200 overflow-x-hidden text-ellipsis flex gap-2 items-center"
                                        >
                                            Batch {item?.batchNo}
                                        </button>
                                    )
                                })
                            }
                        </Select>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Barcode;