import { Users, Phone, Calendar, Barcode, Package, PhilippinePeso, CreditCard, MapPinHouse, Hash } from 'lucide-react';
import { useLayoutEffect, useState, useRef } from 'react';
import { getData, sendJSON } from '@/utils/send';
import { urls, apiUrl } from '@/constants/urls';
import { formattedDateAndTime } from '@/utils/datetime';

import CalendarPicker from '@/components/CalendarPicker';
import Loading from '@/components/Loading';

const SoldItems = () => {
    const [isCompactView, setIsCompactView] = useState(window.innerWidth <= 768);
    const [soldItemsToShow, setSoldItemsToShow] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().getTime());
    const [loading, setLoading] = useState(false);

    const calendarInputRef = useRef(null);

    const selectDate = async (value) => {
        try {
            setLoading(true);
            const payload = { date: value };
            const response = await sendJSON(urls.dateofsolditems, payload);
            if (response) {
                const data = response?.results;
                setSoldItemsToShow(data);
            }
        } catch (error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
            setSelectedDate(value);
        }
    }

    const openCalendar = () => {
        try {
            calendarInputRef.current?.showPicker();
        } catch(error) {}
    }

    const getSoldItemsToday = async () => {
        try {
            setLoading(true);
            const response = await getData(urls.solditemstoday);
            if (response) {
                const data = response?.results;
                setSoldItemsToShow(data);
            }
        } catch (error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        getSoldItemsToday();

        const handleResize = () => setIsCompactView(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const renderCompactCard = (item) => (
        <div className="mx-auto bg-white shadow-lg rounded-lg overflow-hidden mb-1">
            <div className="bg-[#080] p-4 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold">Order Information</h2>
                <Package className="w-6 h-6" />
            </div>

            <div className="p-4 space-y-3">
                {item?.itemImage ? (
                    <img
                        src={`${apiUrl}/fl/items/${item?.itemImage}`}
                        alt="ovida-product"
                        className="w-[80px] h-[80px] object-contain"
                        onError={ev => {
                            // just for dev and production to prevent error
                            ev.target.src='/image-off.png';
                            ev.onerror=null; // prevents infinite loop
                        }}
                    />
                ) : (
                    <Package className="w-16 h-16" />
                )}

                <hr />

                <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-green-700" />
                    <span className="font-semibold">
                        {`${item?.firstname} ${item?.lastname}`}
                    </span>
                </div>

                <div className="flex items-center space-x-3">
                    <MapPinHouse className="w-5 h-5 text-green-700" />
                    <span>{item?.address}</span>
                </div>

                <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-green-700" />
                    <span>{item?.firstContactNo}</span>
                    {item?.secondContactNo && <span> / {item?.secondContactNo}</span>}
                </div>

                <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-green-700" />
                    <span>{formattedDateAndTime(new Date(item?.soldAt))}</span>
                </div>

                <div className="flex items-center space-x-3">
                    <Barcode className="w-5 h-5 text-green-700" />
                    <span>{item?.barcode}</span>
                </div>

                <div className="flex items-center space-x-3">
                    <Hash className="w-5 h-5 text-green-700" />
                    <span>{item?.itemCode}</span>
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
                        <PhilippinePeso className="w-5 h-5 text-green-600" />
                        <span>SRP</span>
                    </div>
                    <span className="font-bold text-green-600">{item?.srp}</span>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <PhilippinePeso className="w-5 h-5 text-green-600" />
                        <span>Total</span>
                    </div>
                    <span className="font-bold text-green-600">{
                        !!item?.isDiscounted ? item?.maxDiscount : item?.srp}
                    </span>
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
    );

    const renderTableView = (item) => {
        return (
            <div className="w-full bg-white shadow-lg rounded-xl overflow-hidden flex flex-col md:flex-row border">
                <div className="md:w-[150px] bg-green-50 p-4 flex items-center justify-center">
                    {item?.itemImage ? (
                        <img
                            src={`${apiUrl}/fl/items/${item?.itemImage}`}
                            alt="product"
                            className="w-[100px] h-[100px] object-contain rounded-md"
                            onError={ev => {
                                // just for dev and production to prevent error
                                ev.target.src='/image-off.png';
                                ev.onerror=null; // prevents infinite loop
                            }}
                        />
                    ) : (
                        <Package className="w-20 h-20 text-green-600" />
                    )}
                </div>

                <div className="md:w-full p-4 grid grid-cols-3 gap-3">
                    <div className="col-span-3 md:col-span-2 flex items-center space-x-3 border-b pb-2">
                        <Users className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-lg">{`${item?.firstname} ${item?.lastname}`}</span>
                    </div>

                    <div className="col-span-3 md:col-span-1 flex items-center space-x-3 border-b pb-2 justify-end">
                        <MapPinHouse className="w-5 h-5 text-green-700" />
                        <span className="text-sm">{item?.address}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-green-700" />
                        <span>{item?.firstContactNo}</span>
                        {item?.secondContactNo && <span> / {item?.secondContactNo}</span>}
                    </div>

                    <div className="flex justify-center items-center space-x-3">
                        <Barcode className="w-5 h-5 text-green-700" />
                        <span>{item?.barcode}</span>
                    </div>

                    <div className="flex justify-end items-center space-x-3">
                        <Calendar className="w-5 h-5 text-green-700" />
                        <span>{formattedDateAndTime(new Date(item?.soldAt))}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Hash className="w-5 h-5 text-green-700" />
                        <span>{item?.itemCode}</span>
                    </div>

                    <div className="flex justify-center items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <PhilippinePeso className="w-5 h-5 text-green-600" />
                            <span>SRP</span>
                        </div>
                        <span className="font-bold text-green-600">{item?.srp}</span>
                    </div>

                    <div className="col-span-3 flex justify-between items-center bg-green-50 p-3 rounded-md">
                        <div className="flex items-center space-x-2">
                            <Package className="w-5 h-5 text-green-600" />
                            <span className="font-semibold">{item?.itemDescription}</span>
                        </div>
                        <span className="text-sm text-green-800">{item?.productTypeName}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <PhilippinePeso className="w-5 h-5 text-green-600" />
                            <span>Total</span>
                        </div>
                        <span className="font-bold text-green-600">
                            {!!item?.isDiscounted ? item?.maxDiscount : item?.srp}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <CreditCard className="w-5 h-5 text-green-700" />
                            <span>Payment</span>
                        </div>
                        <span>{item?.paymentMethod}</span>
                    </div>

                    <div className="col-span-3 p-1 text-sm flex justify-between bg-gray-50 rounded-md">
                        <span>Supplier: {item?.supplierName}</span>
                        <span>Batch: {item?.batchNo}</span>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <Loading customStyle="w-full h-screen" />
        )
    }

    return (
        <main className="absolute top-0 
            left-admin-sidebar-sm lg:left-admin-sidebar-lg 
            w-[calc(100vw-var(--admin-sidebar-width-sm))] lg:w-[calc(100vw-var(--admin-sidebar-width-lg))] 
            h-screen bg-neutral-100 p-4 lg:px-6
            flex flex-col"
        >
            <section className="flex items-center gap-4">
                <h1 className="hidden sm:flex font-semibold text-lg">Sold Items</h1>
                {/* <Searchbar ref={searchBar} search={() => {}} /> */}
            </section>
            <section>
                <h1 className="flex sm:hidden font-semibold text-lg">Sold Items</h1>
            </section>
            <section className="grow w-full h-full relative flex flex-col overflow-hidden">
                <div className="flex justify-between items-center py-1 px-2 rounded-lg bg-white mb-2 mr-1">
                    <CalendarPicker callback={selectDate} selectedDate={selectedDate} />
                    <span className="text-md">
                        Total Sold Items: <span className="font-semibold text-md">{soldItemsToShow?.length ?? 0}</span>
                    </span>
                </div>
                <div className="
                    w-full h-full flex flex-col gap-2 pr-1
                    overflow-x-hidden overflow-y-auto
                    [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:rounded-lg
                    [&::-webkit-scrollbar-track]:bg-gray-400/70
                    [&::-webkit-scrollbar-thumb]:rounded-lg
                    [&::-webkit-scrollbar-thumb]:bg-gray-300
                ">
                    {soldItemsToShow?.length<=0 && (
                        <div className="absolute top-[60px] left-0 right-0 bottom-0 flex justify-center items-center">
                            <h3>No sold items found for the selected date. Please try a different date.</h3>
                        </div>
                    )}
                    {soldItemsToShow?.map((item, index) => (
                        <div key={index}>
                            {isCompactView ?
                                renderCompactCard(item)
                                :
                                renderTableView(item)
                            }
                        </div>
                    )
                    )}
                </div>
            </section>
        </main>
    )
}

export default SoldItems;
