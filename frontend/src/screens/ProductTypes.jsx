import { Plus, Ellipsis, Image } from 'lucide-react';
import { Prompt } from '@/components/Modal';
import { Link, useNavigate } from 'react-router-dom';
import { useLayoutEffect, useState, useRef, act } from 'react';
import { getData, sendJSON } from '@/utils/send';
import { urls, apiUrl } from '@/constants/urls';
import { formattedDateAndTime } from '@/utils/datetime';
import { zProductType } from '@/store/productType';

import Searchbar from '@/components/Searchbar';
import Loading from '@/components/Loading';

const ProductTypes = () => {
    const [productTypes, setProductTypes] = useState([]);
    const [displayProductTypes, setDisplayProductTypes] = useState([]); // holder
    const [productTypeActions, setProductTypeActions] = useState([]);
    const [disablePrompt, setDisablePrompt] = useState(false);
    const [enablePrompt, setEnablePrompt] = useState(false);
    const [tabs, setTabs] = useState({all: true, active: false, inactive: false}); // tabs
    const [loading, setLoading] = useState(false);

    const actionId = useRef(null);
    const searchBar = useRef(null);
    const navigate = useNavigate();

    const tabNavigate = (tab) => {
        if(searchBar.current) searchBar.current.value = '';
        setTabs({all: false, active: false, inactive: false, [tab]: true});

        if(tab === 'all') {
            setDisplayProductTypes(productTypes);
            return;
        }

        const nProductTypes = [];
        for(let i = 0; i < productTypes.length; i++) {
            const productType = productTypes[i];
            if(productType?.status===tab) nProductTypes.push(productType);
        }

        setDisplayProductTypes(nProductTypes);
    }

    const search = (ev) => {
        try {
            const input = ev.target.value.trim().toLowerCase();
            let tabSelected = 'all';
            for(const index in tabs) {
                tabSelected = tabs[index] ? index : tabSelected;
            }

            if(!input) {
                tabNavigate(tabSelected);
                return;
            }

            const searched = [];
            const isTabAll = tabs?.all;
            for(let i = 0; i < productTypes.length; i++) {
                const name = String(productTypes[i]?.name || '')?.trim()?.toLowerCase();
                const status = productTypes[i]?.status;
                if(name?.match(input)) {
                    if(tabs[status] || isTabAll){
                        searched.push(productTypes[i]);
                    }
                }
            }

            setDisplayProductTypes(searched);
        } catch(error) {
            console.log(error);
        } finally {}
    }

    const changeProductTypeStatus = async (changeTo) => {
        try {
            setLoading(true);
            if(changeTo==='active') setEnablePrompt(false);
            else if(changeTo==='inactive') setDisablePrompt(false);
            else throw new Error('Error status type is undefined');

            if(!actionId.current) throw new Error('Product type not recognized');

            const payload = {id: actionId.current, changeTo};
            const response = await sendJSON(urls?.updateproducttypestatus, payload, 'PATCH');
            if(response) {
                // console.log(response?.message || '');
                await getProductTypes();
            }
        } catch(error) {
            console.log(error);
        } finally {
            setLoading(false);
            actionId.current = null;
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
                setProductTypeActions(Array(data?.length).fill(false));
            }
        } catch(error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        let tabSelected = 'all';
        for(const index in tabs) {
            tabSelected = tabs[index] ? index : tabSelected;
        }

        tabNavigate(tabSelected);
    }, [productTypes]);

    useLayoutEffect(() => {
        getProductTypes();

        const closeActions = () => setProductTypeActions(state => state.map(item => false));
        addEventListener('click', closeActions);
        return () => {
            removeEventListener('click', closeActions);
        }
    }, []);

    if(disablePrompt) {
        return (
            <Prompt 
                header="Are you sure you want to disable this product type?" 
                message="Disabled product types will not be available for new transactions but can still be viewed in the system." 
                callback={()=>changeProductTypeStatus('inactive')} 
                onClose={()=>setDisablePrompt(false)} 
            />
        )
    }

    if(enablePrompt) {
        return (
            <Prompt 
                header="Would you like to enable this product type?" 
                message="Once enabled, they will be available for new transactions." 
                callback={()=>changeProductTypeStatus('active')} 
                onClose={()=>setEnablePrompt(false)} 
            />
        )
    }

    if(loading) {
        return (
            <Loading customStyle="w-full h-screen" />
        )
    }

    return (
        <div className="absolute top-0 
            left-admin-sidebar-sm lg:left-admin-sidebar-lg 
            w-[calc(100vw-var(--admin-sidebar-width-sm))] lg:w-[calc(100vw-var(--admin-sidebar-width-lg))] 
            min-h-screen bg-neutral-100 p-4 lg:px-6
            flex flex-col"
        >
            <section className="flex justify-between items-center gap-4">
                <h1 className="hidden sm:flex font-semibold text-lg">Product Types</h1>
                <Searchbar ref={searchBar} search={search} />
                <Link
                    to="/admin/new-product-type"
                    className="flex gap-2 items-center justify-center leading-none bg-green-600 text-white font-bold rounded-full p-2 sm:pr-4 hover:bg-green-800"
                >
                    <Plus />
                    <span className="hidden sm:flex text-nowrap">New Product Type</span>
                </Link>
            </section>
            <h1 className="flex sm:hidden font-semibold text-lg">Product Types</h1>
            <div className="grow w-full h-full relative">
                {/* container with scroll bar */}
                <div className="w-full absolute top-0 left-0 right-0 bottom-0 bg-white mt-2 rounded-lg shadow-md 
                    overflow-x-hidden overflow-y-auto
                    [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:rounded-full
                    [&::-webkit-scrollbar-track]:bg-gray-100
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-gray-300
                    dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                    dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500
                ">
                    <div className="h-[40px] border-b p-2 flex gap-2">
                        <button onClick={() => tabNavigate('all')} className={`rounded-lg px-2 ${tabs.all&&'bg-green-600 text-white'}`}>All</button>
                        <button onClick={() => tabNavigate('active')} className={`rounded-lg px-2 ${tabs.active&&'bg-green-600 text-white'}`}>Active</button>
                        <button onClick={() => tabNavigate('inactive')} className={`rounded-lg px-2 ${tabs.inactive&&'bg-green-600 text-white'}`}>Inactive</button>
                    </div>
                    {
                        productTypes?.length > 0 ? (
                            <>{displayProductTypes?.length > 0 ? (
                                <ul className="flex flex-col gap-2 p-2">
                                    {
                                        displayProductTypes.map((item, index) => {
                                            const isActive = item?.status==='active';
                                            return (
                                                <li key={item?.id}>
                                                    <div className="h-[120px] md:h-fit flex p-1 border border-neutral-300 rounded-lg">
                                                        <img 
                                                            src={`${apiUrl}/producttypes/${item?.image}`}
                                                            alt="ovida-product-type" 
                                                            className="size-[80px] rounded-lg border"
                                                            onError={ev => {
                                                                ev.target.src='../../public/image-off.png'
                                                                ev.onerror=null;
                                                            }}
                                                        />
                                                        <div className="w-full h-full md:h-[80px] 
                                                            flex md:justify-between
                                                            p-2">
                                                            <div className="w-full flex flex-col md:w-fit">
                                                                <div className="flex flex-col">
                                                                    <h3 className="font-semibold text-lg">{item?.name}</h3>
                                                                    <p className={`w-fit h-6 text-white text-sm px-2 rounded-full ${isActive?'bg-green-500':'bg-red-500'}`}>
                                                                        {item?.status}
                                                                    </p>
                                                                </div>
                                                                <p className="text-[14px] md:text-base">{item?.contact}</p>
                                                                {/* display only for small screen */}
                                                                <p className="flex md:hidden text-[14px]">
                                                                    {formattedDateAndTime(new Date(item?.updatedAt))}
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-col md:items-end md:justify-start">
                                                                <div className="relative size-[26px] rounded-full hover:cursor-pointer hover:bg-gray-200">
                                                                    <button 
                                                                        onClick={(ev) => {
                                                                            ev.stopPropagation();
                                                                            setProductTypeActions(state => state.map((_, i) => i===index))
                                                                        }}
                                                                        className="z-0"
                                                                    >
                                                                        <Ellipsis />
                                                                    </button>
                                                                    <article className={`absolute right-0 z-10 text-sm bg-white rounded-lg border p-1 ${productTypeActions[index]?'block':'hidden'}`}>
                                                                        <button
                                                                            onClick={() => {
                                                                                actionId.current = item?.id;
                                                                                setEnablePrompt(true)} 
                                                                            }
                                                                            className={`w-full hover:bg-gray-100 p-1 rounded-lg ${isActive?'opacity-50':'opacity-100'}`}
                                                                            disabled={isActive}
                                                                        >
                                                                            Enable
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                actionId.current = item?.id;
                                                                                setDisablePrompt(true)} 
                                                                            }
                                                                            className={`w-full hover:bg-gray-100 p-1 rounded-lg ${!isActive?'opacity-50':'opacity-100'}`}
                                                                            disabled={!isActive}
                                                                        >
                                                                            Disable
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                if(isActive) {
                                                                                    const {id, name, image, status} = item;
                                                                                    zProductType.getState()?.saveProductTypeData(id, name, image, status);
                                                                                    navigate('/admin/update-product-type');
                                                                                }
                                                                            }}
                                                                            className={`w-full hover:bg-gray-100 p-1 rounded-lg ${!isActive?'opacity-50':'opacity-100'}`}
                                                                            disabled={!isActive}
                                                                        >
                                                                                Update
                                                                            </button>
                                                                    </article>
                                                                </div>
                                                                {/* display only for large screen */}
                                                                <p className="hidden md:flex">{formattedDateAndTime(new Date(item?.updatedAt))}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                            ) : (
                                <div className="w-full h-screen flex justify-center items-center">
                                    <h3>Search not found</h3>
                                </div>
                            )}</>
                        ) : (
                            <div className="w-full h-screen flex justify-center items-center">
                                <h3>No Product Types found</h3>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
}

export default ProductTypes;