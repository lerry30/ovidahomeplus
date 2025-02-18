import { CircleX } from 'lucide-react';
import { Prompt } from '@/components/Modal';
import { useLayoutEffect, useState, useRef } from 'react';
import { sendForm, getData } from '@/utils/send';
import { urls, apiUrl } from '@/constants/urls';
import { useNavigate, Link } from 'react-router-dom';
import { toNumber, formattedNumber } from '@/utils/number';
// import { isValidDate } from '@/utils/datetime';
import { zItem } from '@/store/item';

import ImageUpload from '@/components/ImageUpload';
import SidebarLayout from '@/components/Sidebar';
import Loading from '@/components/Loading';
import ErrorField from '@/components/ErrorField';

import Select, {SelectButton} from '@/components/DropDown';

const UpdateItem = () => {
    const currentSupplierName = zItem(state => state?.supplierName);
    //const currentDeliveryPrice = zItem(state => state?.deliveryPrice);
    const currentProductTypeName = zItem(state => state?.productTypeName);
    const currentDescription = zItem(state => state?.description);
    const currentItemCode = zItem(state => state?.itemCode);
    const currentSrp = zItem(state => state?.srp);
    const currentUnit = zItem(state => state?.unit);
    const currentImage = zItem(state => state?.image);

    const [data, setData] = useState({
        productType: currentProductTypeName, // to display
        productTypeId: 0, // to send ---------------------------
        description: [], // ------------------------------------
        supplier: currentSupplierName,  // to display
        supplierId: 0, // to send ------------------------------
        //deliveryPrice: currentDeliveryPrice,
        itemCode: currentItemCode,
        srp: currentSrp,
        units: currentUnit,
    });
    const [errorData, setErrorData] = useState({
        productType: '',
        description: '',
        supplier: '',
        //deliveryPrice: '',
        itemCode: '',
        //srp: '',
        units: '',
        default: ''
    });
    const [image, setImage] = useState(undefined);
    const [suppliers, setSuppliers] = useState([]);
    const [productTypes, setProductTypes] = useState([]);
    const [zeroSrpPrompt, setZeroSrpPrompt] = useState({header: '', message: ''});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const descriptionInputRef = useRef(null);
    const formData = useRef(null);

    //const PROFIT_MARGIN = 0.4576;

    const enterNewDescription = (ev) => {
        const input = ev.key;
        if(input === 'Enter') {
            if(data?.description?.length >= 4) return;
            const inputValue = ev.target.value;
            if(!inputValue) return;
            setData(state => ({...state, description: [...state?.description, inputValue]}));
            ev.target.value = '';
        }
    }

    // I separate this to allow zero srp prompt
    const requestForUpdateItem = async () => {
        try {
            const response = await sendForm(urls?.updateitem, formData.current, 'PUT');
            if(response) {
                //console.log(response?.message);
                navigate('/admin/inventory');
            }
        } catch(error) {
            console.log(error);
            setErrorData(state => ({...state, default: error?.message}));
        }
    }

    const item = async () => {
        try {
            setLoading(true);

            // just to insert description which exists in input field yet
            const nDescription = descriptionInputRef.current?.value ?? '';
            const allDescription = data?.description;
            if(nDescription) allDescription.push(nDescription);

            const productType = data?.productType?.trim();
            const productTypeId = toNumber(data?.productTypeId);
            const description = allDescription?.join(',')?.trim();

            const supplier = data?.supplier?.trim();
            const supplierId = toNumber(data?.supplierId);
            //const deliveryPrice = toNumber(data?.deliveryPrice);

            const itemCode = data?.itemCode?.trim()?.toUpperCase();
            const srp = toNumber(data?.srp);
            const unit = data?.units?.trim();

            if(!zItem.getState()?.id) throw new Error('Item not found');

            let hasError = false;
            if(!productType || !productTypeId) {
                setErrorData(state => ({...state, productType: 'Please select a product type from the dropdown menu.'}));
                hasError = true;
            }
            
            if(!description) {
                setErrorData(state => ({...state, description: 'Please include the product description to highlight its unique features..'}));
                hasError = true;
            }

            if(!supplier || !supplierId) {
                setErrorData(state => ({...state, supplier: 'Please select a supplier from the dropdown menu.'}));
                hasError = true;
            }

            //if(deliveryPrice <= 0) {
            //    setErrorData(state => ({...state, deliveryPrice: 'Delivery price must be greater than zero.'}));
            //    hasError = true;
            //}

            if(!itemCode) {
                setErrorData(state => ({...state, itemCode: 'Please provide an item code.'}));
                hasError = true;
            }

            //if(srp <= 0) {
            //    setErrorData(state => ({...state, srp: 'SRP must be greater than zero.'}));
            //    hasError = true;
            //}

            if(!unit) {
                setErrorData(state => ({...state, units: 'Please select units from the dropdown menu.'}));
                hasError = true;
            }

            if(hasError) throw new Error('Ensure all fields above are filled.');

            const form = new FormData();
            form.append('id', zItem.getState()?.id);
            form.append('productTypeId', productTypeId);
            form.append('description', description);
            form.append('supplierId', supplierId);
            //form.append('deliveryPrice', deliveryPrice);
            form.append('itemCode', itemCode);
            form.append('srp', srp);
            form.append('unit', unit);
            form.append('file', image);

            // made it a global since the zero srp prompt is included
            formData.current = form;

            // move this filter down to allow zero srp
            if(srp <= 0) {
                setZeroSrpPrompt({
                    header: 'Zero SRP', 
                    message: 'Are you sure you want to allow zero SRP for this item?'
                });
                return;
            }

            await requestForUpdateItem();
        } catch(error) {
            console.log(error?.message);
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

    const getProductTypes = async () => {
        try {
            setLoading(true);
            const response = await getData(urls?.getproducttypes);
            if(response) {
                // console.log(response);
                const data = response?.results || [];
                setProductTypes(data);
            }
        } catch(error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const setIdle = () => {
        // productTypeId: 0, // to send ---------------------------
        // supplierId: 0, // to send ------------------------------
        // description: [], // ------------------------------------

        const idleData = {
            productTypeId: 0, 
            supplierId: 0,
            // deliveryDate: '',
            description: []
        };

        // get product type id
        for(const type of productTypes) {
            if(type.name === currentProductTypeName) {
                idleData.productTypeId = type.id;
            }
        }

        // get supplierId
        for(const supplier of suppliers) {
            if(supplier?.name === currentSupplierName) {
                idleData.supplierId = supplier.id;
            }
        }

        // set delivery date from database and turn it to format needed for html input
        // const fDeliveryDate = new Date(currentDeliveryDate);
        // const year = fDeliveryDate?.getFullYear();
        // const month = String(fDeliveryDate?.getMonth()).padStart(2, '0');
        // const day = String(fDeliveryDate?.getDay()).padStart(2, '0');
        // const deliveryDate = `${year}-${month}-${day}`;
        // idleData.deliveryDate = deliveryDate;

        // description
        const descArray = String(currentDescription).split(',');
        idleData.description = descArray;
        
        setData(state => ({...state, ...idleData}));
    }

    const focusOnInput = (ev) => {
        const input = ev?.target?.querySelector('input');
        if(input && input?.nodeName=='INPUT') input.focus();
    }

    useLayoutEffect(() => {
        setIdle();
    }, [productTypes, suppliers]);

    //useLayoutEffect(() => {
    //    const profitMargin = toNumber(data?.deliveryPrice) * PROFIT_MARGIN + toNumber(data?.deliveryPrice);
    //    setData(state => ({...state, srp: profitMargin}));
    //}, [data?.deliveryPrice]);

    useLayoutEffect(() => {
        getSuppliers();
        getProductTypes();

        zItem.getState()?.reloadItemData();

        const onPageClick = () => {
            const nDescription = descriptionInputRef.current?.value ?? '';
            if(nDescription) {
                setData(state => ({...state, description: [...state?.description, nDescription]}));
                descriptionInputRef.current.value = '';
            }
        }
        addEventListener('click', onPageClick);
        return () => removeEventListener('click', onPageClick);
    }, []);

    if(zeroSrpPrompt?.header && zeroSrpPrompt?.message) {
        return (
            <Prompt 
                header={zeroSrpPrompt.header} 
                message={zeroSrpPrompt.message}
                callback={requestForUpdateItem}
                onClose={() => setZeroSrpPrompt({header: '', message: ''})}
            />
        )
    }

    if(loading) {
        return (
            <Loading customStyle="w-full h-screen" />
        )
    }

        /*<div className="w-full min-h-screen py-4 px-4 md:px-10 lg:px-30 xl:px-40">
            <header className="w-full h-[70px] flex items-center mb-2">
                <Link to="/admin/inventory" className="md:hidden flex justify-center items-center text-sm">
                    <ChevronLeft />
                    back
                </Link>
                <div className="hidden md:flex">
                    <AppLogo segment="/inventory" />
                </div>
                <h1 className="md:absolute md:left-1/2 md:-translate-x-1/2 font-bold text-lg md:text-2xl px-4">Update Item</h1>
            </header>
            <main className="grid grid-cols-1 lg:grid-cols-4 gap-2 bg-neutral-100 p-4">*/
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
                        Update Item
                    </h1>
                </header>
                <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-2 bg-neutral-100 pt-2">
                    <section className="bg-white rounded-md p-4">
                        <ImageUpload
                            fileData={[image, setImage]} 
                            initialImageSrc={`${apiUrl}/fl/items/${currentImage}`}
                            className="size-[100px]" 
                        />
                    </section>
                    <section className="lg:col-start-2 lg:col-span-3 bg-white rounded-md p-4 flex flex-col gap-2">
                        <h3 className="font-bold text-lg">Product Details</h3>
                        {/* Product */}
                        <hr />
                        <div className="flex flex-col sm:px-4 gap-2">
                            <h3 className="font-semibold">
                                Product Type
                                <span className="text-red-500">*</span>
                            </h3>
                            <div className="flex items-center gap-4">
                                <Select name="Select Product Type" className="w-fit py-2 max-h-[40px] rounded-lg border-2 border-neutral-400 z-30">
                                    {
                                        productTypes.map((item, index) => {
                                            if(item?.status !== 'active') return null;
                                            return (
                                                <SelectButton
                                                    key={index}
                                                    text={item?.name}
                                                    onClick={() => {
                                                        setData(state => ({...state, productType: item?.name, productTypeId: item?.id}));
                                                    }}
                                                />
                                            )
                                        })
                                    }
                                </Select>
                                {/* Dropdown output */}
                                {data?.productType && <span className="bg-green-400/50 p-2 rounded-md">{data?.productType}</span>}
                            </div>
                            <ErrorField message={errorData?.productType || ''} />
                        </div>
                        <div className="w-full sm:px-4">
                            <h3 className="font-semibold">
                                Description
                                {/* <span className="text-red-500">*</span> */}
                            </h3>
                            <small>Add up to a maximum of 4 description categories.</small>
                            <article 
                                onClick={focusOnInput}
                                className="w-full min-h-[50px] flex flex-wrap gap-2 border rounded-lg p-2"
                            >
                                {data.description.map((item, index) => {
                                    if(!item) return null;
                                    return (
                                        <div key={index} className="flex items-center gap-2 border rounded-lg p-2">
                                            <span className="text-wrap">
                                                {item}
                                            </span>
                                            <button 
                                                onClick={() => {
                                                    const descriptionArray = data?.description?.filter((_, i) => i!==index);
                                                    setData(state => ({...state, description: descriptionArray}));
                                                }}
                                            >
                                                <CircleX size={20} />
                                            </button>
                                        </div>
                                    )
                                })}
                                <input 
                                    ref={descriptionInputRef}
                                    onKeyDown={enterNewDescription}
                                    className="min-w-[100px] outline-none" 
                                />
                            </article>
                            <ErrorField message={errorData?.description || ''} />
                        </div>

                        {/* Supplier */}
                        <hr />
                        <div className="w-full flex flex-col md:flex-row gap-2">
                            <div className="flex flex-col sm:px-4 gap-2">
                                <h3 className="font-semibold">
                                    Supplier
                                    <span className="text-red-500">*</span>
                                </h3>
                                <div className="flex items-center gap-4">
                                    <Select name="Select Supplier" className="w-fit py-2 max-h-[40px] rounded-lg border-2 border-neutral-400 z-20">
                                        {
                                            suppliers.map((item, index) => {
                                                if(item?.status !== 'active') return null;
                                                return (
                                                    <SelectButton
                                                        key={index}
                                                        text={item?.name}
                                                        onClick={() => {
                                                            setData(state => ({...state, supplier: item?.name, supplierId: item?.id}));
                                                        }}
                                                    />
                                                )
                                            })
                                        }
                                    </Select>
                                    {/* Dropdown output */}
                                    {data?.supplier && <span className="bg-green-400/50 p-2 rounded-md">{data?.supplier}</span>}
                                </div>
                                <ErrorField message={errorData?.supplier || ''} />
                            </div>
                            {/*<div className="w-1/2 flex flex-col sm:px-4 gap-2">
                                <label htmlFor="delivery-price" className="font-semibold">
                                    Delivery Price
                                    <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    id="delivery-price"
                                    value={formattedNumber(data?.deliveryPrice)}
                                    onChange={elem => {
                                        const input = Math.max(0, toNumber(elem.target.value));
                                        setData(state => ({...state, deliveryPrice: input}))
                                    }}
                                    className="max-w-96 outline-none border-2 border-neutral-400 rounded-lg py-2 px-4"
                                    required
                                />
                                <ErrorField message={errorData?.deliveryPrice || ''} />
                            </div>*/}
                            {/* <div className="w-1/2 flex flex-col sm:px-4 gap-2">
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
                                    className="max-w-96 outline-none border-2 border-neutral-400 rounded-lg py-2 px-4"
                                    required
                                />
                                <ErrorField message={errorData?.deliveryDate || ''} />
                            </div> */}
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
                                    className="max-w-96 outline-none border-2 border-neutral-400 rounded-lg py-2 px-4" 
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
                                    value={formattedNumber(data?.srp)}
                                    onChange={elem => {
                                        const input = Math.max(0, toNumber(elem.target.value));
                                        setData(state => ({...state, srp: input}));
                                    }}
                                    className="max-w-96 outline-none border-2 border-neutral-400 rounded-lg py-2 px-4" 
                                    required
                                />
                                {/*<ErrorField message={errorData?.srp || ''} />*/}
                            </div>
                        </div>
                        <div className="flex flex-col sm:px-4 gap-2">
                            <h3 className="font-semibold">
                                Units
                                <span className="text-red-500">*</span>
                            </h3>
                            <div className="flex items-center gap-4">
                                <Select name="Select Unit" className="w-fit py-2 max-h-[40px] rounded-lg border-2 border-neutral-400 z-10">
                                    <SelectButton
                                        text="pcs"
                                        onClick={() => {
                                            setData(state => ({...state, units: 'pcs'}));
                                        }}
                                    />
                                    <SelectButton
                                        text="set"
                                        onClick={() => {
                                            setData(state => ({...state, units: 'set'}));
                                        }}
                                    />
                                </Select>
                                {/* Dropdown output */}
                                {data?.units && <span className="bg-green-400/50 p-2 rounded-md">{data?.units}</span>}
                            </div>
                            <ErrorField message={errorData?.units || ''} />
                        </div>

                        <div className="w-full flex justify-end gap-2 sm:px-4 sm:py-2">
                            <Link 
                                to="/admin/inventory" 
                                className="flex items-center justify-center leading-none font-bold rounded-lg p-4 text-white bg-gray-500 hover:bg-gray-600"
                            >
                                Cancel
                            </Link>
                            <button 
                                onClick={item} 
                                className="flex items-center justify-center leading-none bg-green-600 text-white font-bold rounded-lg p-4 hover:bg-green-800">
                                Update Item
                            </button>
                        </div>
                        <ErrorField message={errorData?.default || ''} />
                    </section>
                </div>
            </main>
        </div>
    )
}

export default UpdateItem;
