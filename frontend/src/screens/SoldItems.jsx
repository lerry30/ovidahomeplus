import { Users, Phone, Calendar, Barcode, Package, DollarSign, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLayoutEffect, useState, useRef } from 'react';
import { getData } from '@/utils/send';
import { urls } from '@/constants/urls';

import Searchbar from '@/components/Searchbar';
import Loading from '@/components/Loading';

const SoldItems = () => {
    const [today, setToday] = useState([]);
    const [loading, setLoading] = useState(false);

    const searchBar = useRef(null);
    const navigate = useNavigate();

    const getSoldItemsToday = async () => {
        try {
            setLoading(true);
            const response = await getData(urls.solditemstoday);
            if (response) {
                const data = response?.results;
                setToday(data);
            }
        } catch (error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        getSoldItemsToday();
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
            min-h-screen bg-neutral-100 p-4 lg:px-6
            flex flex-col"
        >
            <section className="flex items-center gap-4">
                <h1 className="hidden sm:flex font-semibold text-lg">Sold Items</h1>
                {/* <Searchbar ref={searchBar} search={() => {}} /> */}
            </section>
            <section>
                <h1 className="flex sm:hidden font-semibold text-lg">Sold Items</h1>
            </section>
            <section>
                <h2 className="hidden sm:flex font-semibold text-lg">Today</h2>
            </section>
            <section className="grow w-full h-full relative flex flex-col gap-4">
                {today?.map((item, index) => (
                    <div key={index} className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                        <div className="bg-green-700 p-4 text-white flex justify-between items-center">
                            <h2 className="text-xl font-bold">Order Information</h2>
                            <Package className="w-6 h-6" />
                        </div>

                        <div className="p-4 space-y-3">
                            <div className="flex items-center space-x-3">
                                <Users className="w-5 h-5 text-green-700" />
                                <span className="font-semibold">
                                    {`${item?.firstname} ${item?.lastname}`}
                                </span>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Phone className="w-5 h-5 text-green-700" />
                                <span>{item?.firstContactNo}</span>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Calendar className="w-5 h-5 text-green-700" />
                                <span>{item?.soldAt}</span>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Barcode className="w-5 h-5 text-green-700" />
                                <span>{item?.barcode}</span>
                            </div>

                            <div className="flex justify-between items-center bg-gray-100 p-3 rounded-md">
                                <div className="flex items-center space-x-2">
                                    <Package className="w-5 h-5 text-green-600" />
                                    <span className="font-semibold">{item?.itemDescription}</span>
                                </div>
                                <span className="text-sm text-gray-600">{item?.productTypeName}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                    <span>SRP</span>
                                </div>
                                <span className="font-bold text-green-600">{item?.srp}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                    <CreditCard className="w-5 h-5 text-green-700" />
                                    <span>Payment Method</span>
                                </div>
                                <span>{item?.paymentMethod}</span>
                            </div>
                        </div>

                        <div className="bg-gray-100 p-3 text-sm text-gray-600 flex justify-between">
                            <span>Supplier: {item?.supplierName}</span>
                            <span>Batch: {item?.batchNo}</span>
                        </div>
                    </div>
                ))}
            </section>
        </main>
    )
}

export default SoldItems;