import { ChevronLeft } from 'lucide-react';
import { useLayoutEffect, useState } from 'react';
import { sendForm, getData } from '@/utils/send';
import { urls } from '@/constants/urls';
import { useNavigate, Link } from 'react-router-dom';
import { toNumber } from '@/utils/number';

import AppLogo from '@/components/AppLogo';
import ImageUpload from '@/components/ImageUpload';
import Loading from '@/components/Loading';
import ErrorField from '@/components/ErrorField';
import TitleFormat from '@/utils/titleFormat';
import Select from '@/components/DropDown';

const NewItem = () => {
    const [data, setData] = useState({
        supplier: '', 
        deliveryPrice: 0,
        deliveryDate: '',
        srp: 0,
        units: 'pcs',
        name: '',
    });
    const [errorData, setErrorData] = useState({
        supplier: '',
        deliveryPrice: '',
        deliveryDate: '',
        srp: 0,
        units: '',
        name: '', 
        default: ''
    });
    const [suppliers, setSuppliers] = useState([]);
    const [image, setImage] = useState(undefined);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const PROFIT_MARGIN = 0.4576;

    const item = async () => {
        try {
            setLoading(true);

            // const name = data?.name?.trim();
            // const contact = data?.contact?.trim();

            // if(!name) {
            //     setErrorData(state => ({...state, name: 'Item name is empty.'}));
            //     throw new Error('All fields are required.');
            // }

            // const form = new FormData();
            // form.append('name', TitleFormat(name));
            // form.append('contact', contact);
            // form.append('file', image);

            // const response = await sendForm(urls?.newsupplier, form);
            // if(response) {
            //     console.log(response?.message);
            //     navigate('/admin/supplier');
            // }
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

    useLayoutEffect(() => {
        const profitMargin = toNumber(data?.deliveryPrice) * PROFIT_MARGIN + toNumber(data?.deliveryPrice);
        setData(state => ({...state, srp: profitMargin}));
    }, [data?.deliveryPrice]);

    useLayoutEffect(() => {
        getSuppliers();
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
                <h1 className="md:absolute md:left-1/2 md:-translate-x-1/2 font-bold text-lg md:text-2xl px-4">Create New Product</h1>
            </header>
            <main className="grid grid-cols-1 lg:grid-cols-4 gap-2 bg-neutral-100 p-4">    
                <section className="bg-white rounded-md p-4">
                    <ImageUpload fileData={[image, setImage]} className="size-[100px]" />
                </section>
                <section className="lg:col-start-2 lg:col-span-3 bg-white rounded-md p-4 flex flex-col gap-2">
                    <h3 className="font-bold text-lg">Product Details</h3>
                    {/* Product */}
                    <hr />
                    
                    {/* Supplier */}
                    <hr />
                    <div className="flex flex-col sm:px-4 gap-2">
                        <h3 className="font-semibold">
                            Supplier
                            <span className="text-red-500">*</span>
                        </h3>
                        <div className="flex items-center gap-4">
                            <Select name="Suppliers" className="w-fit py-2 max-h-[40px] rounded-lg border-2 border-neutral-400">
                                {
                                    suppliers.map((item, index) => {
                                        if(item?.status !== 'active') return null;
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setData(state => ({...state, supplier: item?.name}));
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
                            <span>{data?.supplier}</span>
                        </div>
                        <ErrorField message={errorData?.supplier || ''} />
                    </div>
                    <div className="w-full flex flex-col md:flex-row gap-2">
                        <div className="w-1/2 flex flex-col sm:px-4 gap-2">
                            <label htmlFor="delivery-price" className="font-semibold">
                                Delivery Price
                                <span className="text-red-500">*</span>
                            </label>
                            <input 
                                id="delivery-price"
                                value={data?.deliveryPrice}
                                onChange={elem => {
                                    const input = Math.max(0, toNumber(elem.target.value));
                                    setData(state => ({...state, deliveryPrice: input}))
                                }}
                                className="max-w-96 outline-none border-2 border-neutral-400 rounded-full py-2 px-4"
                                required
                            />
                            <ErrorField message={errorData?.deliveryPrice || ''} />
                        </div>
                        <div className="w-1/2 flex flex-col sm:px-4 gap-2">
                            <label htmlFor="delivery-date" className="font-semibold">
                                Delivery Date
                                <span className="text-red-500">*</span>
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
                    </div>
                    {/* Item details */}
                    <hr />
                    <div className="w-full flex flex-col md:flex-row">
                        <div className="w-1/2 flex flex-col sm:px-4 gap-2">
                            <label htmlFor="item-code" className="font-semibold">
                                Item Code
                                <span className="text-red-500">*</span>
                            </label>
                            <input 
                                id="item-code"
                                value={data?.itemCode}
                                onChange={elem => {
                                    const input = elem.target.value;
                                    setData(state => ({...state, itemCode: input}))
                                }}
                                className="max-w-96 outline-none border-2 border-neutral-400 rounded-full py-2 px-4" 
                                placeholder="Item Code"
                                required
                            />
                            <ErrorField message={errorData?.itemCode || ''} />
                        </div>
                        <div className="w-1/2 flex flex-col sm:px-4 gap-2">
                            <label htmlFor="srp" className="font-semibold">
                                SRP
                                <span className="text-red-500">*</span>
                            </label>
                            <input 
                                id="srp"
                                value={data?.srp}
                                onChange={elem => {
                                    const input = Math.max(0, toNumber(elem.target.value));
                                    setData(state => ({...state, srp: input}));
                                }}
                                className="max-w-96 outline-none border-2 border-neutral-400 rounded-full py-2 px-4" 
                                required
                            />
                            <ErrorField message={errorData?.srp || ''} />
                        </div>
                    </div>
                    <div className="flex flex-col sm:px-4 gap-2">
                        <h3 className="font-semibold">
                            Units
                            <span className="text-red-500">*</span>
                        </h3>
                        <div className="flex items-center gap-4">
                            <Select name="Units" className="w-fit py-2 max-h-[40px] rounded-lg border-2 border-neutral-400">
                                <button
                                    onClick={() => {
                                        setData(state => ({...state, units: 'pcs'}));
                                    }}
                                    className="text-nowrap text-[16px] p-2 px-4 rounded-lg hover:bg-gray-200 overflow-x-hidden text-ellipsis flex gap-2 items-center"
                                >
                                    pcs
                                </button>
                                <button
                                    onClick={() => {
                                        setData(state => ({...state, units: 'set'}));
                                    }}
                                    className="text-nowrap text-[16px] p-2 px-4 rounded-lg hover:bg-gray-200 overflow-x-hidden text-ellipsis flex gap-2 items-center"
                                >
                                    set
                                </button>
                            </Select>
                            {/* Dropdown output */}
                            <span>{data?.units}</span>
                        </div>
                        <ErrorField message={errorData?.units || ''} />
                    </div>

                    <div className="sm:px-4 sm:py-2">
                        <button onClick={item} className="flex items-center justify-center leading-none bg-green-600 text-white font-bold rounded-full p-4 hover:bg-green-800">
                            Add New Item
                        </button>
                    </div>
                    <ErrorField message={errorData?.default || ''} />
                </section>
            </main>
        </div>
    )
}

export default NewItem;