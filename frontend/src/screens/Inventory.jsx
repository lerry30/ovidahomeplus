import { Plus, Ellipsis } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useLayoutEffect, useState, useRef } from 'react';
import { getData } from '@/utils/send';
import { urls, apiUrl } from '@/constants/urls';
import { formattedDateAndTime } from '@/utils/datetime';

import Searchbar from '@/components/Searchbar';
import Loading from '@/components/Loading';

const Inventory = () => {
    const [items, setItems] = useState([]);
    const [displayItems, setDisplayItems] = useState([]);
    const [itemActions, setItemActions] = useState([]);
    const [disablePrompt, setDisablePrompt] = useState(false);
    const [enablePrompt, setEnablePrompt] = useState(false);
    const [tabs, setTabs] = useState({all: true, active: false, inactive: false}); // tabs
    const [loading, setLoading] = useState(false);

    const searchBar = useRef(null);
    const navigate = useNavigate();

    const search = (ev) => {
        try {
            const input = ev.target.value.trim().toLowerCase();
            let tabSelected = 'all';
            
        } catch(error) {
            console.log(error);
        } finally {}
    }

    const getItems = async () => {
        try {
            setLoading(true);

            const response = await getData(urls?.getitems);
            if(response) {
                console.log(response?.results);
                const data = response?.results;
                setItems(data);
                setItemActions(Array(data.length).fill(false));
                setDisplayItems(data);
            }
        } catch(error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        getItems();
    }, []);

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
                <h1 className="hidden sm:flex font-semibold text-lg">Inventory</h1>
                <Searchbar ref={searchBar} search={search} />
                <Link
                    to="/admin/new-item"
                    className="flex gap-2 items-center justify-center leading-none bg-green-600 text-white font-bold rounded-full p-2 sm:pr-4 hover:bg-green-800"
                >
                    <Plus />
                    <span className="hidden sm:flex text-nowrap">New Item</span>
                </Link>
            </section>
            <h1 className="flex sm:hidden font-semibold text-lg">Inventory</h1>
            <div className="grow w-full h-full relative">
                {/* container with scroll bar */}
                <div className="w-full absolute top-0 left-0 right-0 bottom-0 bg-white mt-2 rounded-lg shadow-md
                    overflow-auto
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
                        items?.length > 0 ? (
                            <>{displayItems?.length > 0 ? (
                                <ul className="flex flex-col gap-2 p-2">
                                {
                                    displayItems.map((item, index) => {
                                        const isActive = item?.status==='active';
                                        return (
                                            <li key={item?.id}>
                                                <div className="h-[270px] lg:h-fit flex p-1 pb-2 border border-neutral-300 rounded-lg">
                                                    <img 
                                                        src={`${apiUrl}/items/${item?.image}`}
                                                        alt="ovida-product" 
                                                        className="size-[80px] rounded-lg border"
                                                        onError={ev => {
                                                            ev.target.src='../../public/image-off.png'
                                                            ev.onerror=null;
                                                        }}
                                                    />
                                                    <div className="w-full h-full md:h-[80px] 
                                                        grid grid-cols-[repeat(auto-fit,_minmax(150px,_1fr))] gap-4
                                                        p-2">
                                                        <div className="w-full flex flex-col md:w-fit">
                                                            <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                                                                <h3 className="font-semibold text-lg">{item?.productTypeName}</h3>
                                                                <p className={`w-fit h-6 text-white text-sm px-2 rounded-full ${isActive?'bg-green-500':'bg-red-500'}`}>
                                                                    {item?.status}
                                                                </p>
                                                            </div>
                                                            <p className="text-[14px] md:text-base">{item?.description}</p>
                                                            <p>Item Code:&nbsp;&nbsp;{item?.itemCode}</p>
                                                            {/* ------------------------small screen for responsiveness---------------------- */}
                                                            <img 
                                                                src={`${apiUrl}/barcodes/${item?.barcode}.png`}
                                                                alt="ovida-product-barcode" 
                                                                className="w-[120px] h-[50px] object-contain lg:hidden py-2"
                                                                onError={ev => {
                                                                    ev.target.src='../../public/image-off.png'
                                                                    ev.onerror=null;
                                                                }}
                                                            />
                                                            <div className="flex flex-col lg:hidden">
                                                                <article>
                                                                    <span>SRP:&nbsp;&nbsp;</span>
                                                                    <span className="font-semibold">
                                                                        ₱ {item?.srp}
                                                                    </span>
                                                                </article>
                                                                <article>
                                                                    <span>Max discount:&nbsp;&nbsp;</span>
                                                                    <span className="font-semibold">
                                                                        ₱ {item?.maxDiscount}
                                                                    </span>
                                                                </article>
                                                            </div>
                                                            {/* -------------------------------------------------- */}
                                                            {/* display only for small screen */}
                                                            <p className="flex md:hidden text-[14px]">
                                                                {formattedDateAndTime(new Date(item?.updatedAt))}
                                                            </p>
                                                        </div>
                                                        {/* ------------------------large screen for responsiveness---------------------- */}
                                                        <div className="hidden lg:flex flex-col">
                                                            <article>
                                                                <span>SRP:&nbsp;&nbsp;</span>
                                                                <span className="font-semibold">
                                                                    ₱ {item?.srp}
                                                                </span>
                                                            </article>
                                                            <article>
                                                                <span>Max discount:&nbsp;&nbsp;</span>
                                                                <span className="font-semibold">
                                                                    ₱ {item?.maxDiscount}
                                                                </span>
                                                            </article>
                                                        </div>
                                                        <img 
                                                            src={`${apiUrl}/barcodes/${item?.barcode}.png`}
                                                            alt="ovida-product-barcode" 
                                                            className="w-[120px] h-[50px] object-contain hidden lg:flex"
                                                            onError={ev => {
                                                                ev.target.src='../../public/image-off.png'
                                                                ev.onerror=null;
                                                            }}
                                                        />
                                                        <div className="flex flex-col md:items-end md:justify-start">
                                                            <div className="relative size-[26px] rounded-full hover:cursor-pointer hover:bg-gray-200">
                                                                <button 
                                                                    onClick={(ev) => {
                                                                        ev.stopPropagation();
                                                                        setItemActions(state => state.map((_, i) => i===index))
                                                                    }}
                                                                    className="z-0"
                                                                >
                                                                    <Ellipsis />
                                                                </button>
                                                                <article className={`absolute right-0 z-10 text-sm bg-white rounded-lg border p-1 ${itemActions[index]?'block':'hidden'}`}>
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
                                <h3>No items found</h3>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
}

export default Inventory;