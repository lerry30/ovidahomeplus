import { Plus, Ellipsis } from 'lucide-react';
import { Prompt } from '@/components/Modal';
import { Link, useNavigate } from 'react-router-dom';
import { useLayoutEffect, useState, useRef, act } from 'react';
import { getData, sendJSON } from '@/utils/send';
import { urls, apiUrl } from '@/constants/urls';
import { formattedDateAndTime } from '@/utils/datetime';
import { zSupplier } from '@/store/supplier';

import Searchbar from '@/components/Searchbar';
import Loading from '@/components/Loading';

const Supplier = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [displaySupplier, setDisplaySupplier] = useState([]); // holder
    const [supplierActions, setSupplierActions] = useState([]);
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
            setDisplaySupplier(suppliers);
            return;
        }

        const nSuppliers = [];
        for(let i = 0; i < suppliers.length; i++) {
            const supplier = suppliers[i];
            if(supplier?.status===tab) nSuppliers.push(supplier);
        }

        setDisplaySupplier(nSuppliers);
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
            for(let i = 0; i < suppliers.length; i++) {
                const name = String(suppliers[i]?.name || '')?.trim()?.toLowerCase();
                const status = suppliers[i]?.status;
                if(name?.match(input)) {
                    if(tabs[status] || isTabAll){
                        searched.push(suppliers[i]);
                    }
                }
            }

            setDisplaySupplier(searched);
        } catch(error) {
            console.log(error);
        } finally {}
    }

    const changeSupplierStatus = async (changeTo) => {
        try {
            setLoading(true);
            if(changeTo==='active') setEnablePrompt(false);
            else if(changeTo==='inactive') setDisablePrompt(false);
            else throw new Error('Error status type is undefined');

            if(!actionId.current) throw new Error('Supplier not recognized');

            const payload = {id: actionId.current, changeTo};
            const response = await sendJSON(urls?.updatesupplierstatus, payload, 'PATCH');
            if(response) {
                // console.log(response?.message || '');
                await getSuppliers();
            }
        } catch(error) {
            console.log(error);
        } finally {
            setLoading(false);
            actionId.current = null;
        }
    }

    const getSuppliers = async () => {
        try {
            setLoading(true);
            const response = await getData(urls?.getsuppliers);
            if(response) {
                //console.log(response?.results);
                const data = response?.results || [];
                setSuppliers(data);
                setSupplierActions(Array(data?.length).fill(false));
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
    }, [suppliers]);

    useLayoutEffect(() => {
        getSuppliers();

        const closeActions = () => setSupplierActions(state => state.map(item => false));
        addEventListener('click', closeActions);
        return () => {
            removeEventListener('click', closeActions);
        }
    }, []);

    if(disablePrompt) {
        return (
            <Prompt 
                header="Are you sure you want to disable this supplier?" 
                message="Disabled suppliers will not be available for new transactions but can still be viewed in the system." 
                callback={()=>changeSupplierStatus('inactive')} 
                onClose={()=>setDisablePrompt(false)} 
            />
        )
    }

    if(enablePrompt) {
        return (
            <Prompt 
                header="Would you like to enable this supplier?" 
                message="Once enabled, they will be available for new transactions." 
                callback={()=>changeSupplierStatus('active')} 
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
        <main className="absolute top-0 
            left-admin-sidebar-sm lg:left-admin-sidebar-lg 
            w-[calc(100vw-var(--admin-sidebar-width-sm))] lg:w-[calc(100vw-var(--admin-sidebar-width-lg))] 
            min-h-screen bg-neutral-100 p-4 lg:px-6
            flex flex-col"
        >
            <section className="flex justify-between items-center gap-4">
                <h1 className="hidden sm:flex font-semibold text-lg">Suppliers</h1>
                <Searchbar ref={searchBar} search={search} />
                <Link
                    to="/admin/new-supplier"
                    className="flex gap-2 items-center justify-center leading-none bg-green-600 text-white font-bold rounded-lg p-2 sm:pr-4 hover:bg-green-800"
                >
                    <Plus />
                    <span className="hidden sm:flex text-nowrap">New Supplier</span>
                </Link>
            </section>
            <section>
                <h1 className="flex sm:hidden font-semibold text-lg">Supplier</h1>
            </section>
            <section className="grow w-full h-full relative">
                {/* container with scroll bar */}
                <div className="w-full absolute top-0 left-0 right-0 bottom-0 bg-white mt-2 rounded-lg shadow-md overflow-hidden">
                    <div className="h-[40px] border-b p-2 flex gap-2">
                        <button onClick={() => tabNavigate('all')} className={`rounded-lg px-2 ${tabs.all&&'bg-green-600 text-white'}`}>All</button>
                        <button onClick={() => tabNavigate('active')} className={`rounded-lg px-2 ${tabs.active&&'bg-green-600 text-white'}`}>Active</button>
                        <button onClick={() => tabNavigate('inactive')} className={`rounded-lg px-2 ${tabs.inactive&&'bg-green-600 text-white'}`}>Inactive</button>
                    </div>
                    {
                        suppliers?.length > 0 ? (
                            <>{displaySupplier?.length > 0 ? (
                                <ul className="w-full h-full flex flex-col gap-2 p-2 pb-20
                                    overflow-y-auto
                                    [&::-webkit-scrollbar]:w-2
                                    [&::-webkit-scrollbar-track]:rounded-lg
                                    [&::-webkit-scrollbar-track]:bg-gray-100
                                    [&::-webkit-scrollbar-thumb]:rounded-lg
                                    [&::-webkit-scrollbar-thumb]:bg-gray-300
                                ">
                                    {
                                        displaySupplier.map((item, index) => {
                                            const isActive = item?.status==='active';
                                            return (
                                                <li key={item?.id}>
                                                    <div className="h-[180px] md:h-fit flex p-1 border border-neutral-300 rounded-lg">
                                                        <img 
                                                            src={`${apiUrl}/fl/suppliers/${item?.image}`}
                                                            alt="ovida-supplier" 
                                                            className="size-[80px] rounded-lg border object-contain"
                                                            onError={ev => {
                                                                ev.target.src=`${apiUrl}/image-off.png`
                                                                ev.onerror=null; // prevents infinite loop
                                                            }}
                                                        />
                                                        <div className="w-full h-full md:h-[80px] 
                                                            flex md:justify-between
                                                            p-2">
                                                            <div className="w-full flex flex-col md:w-fit">
                                                                <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                                                                    <h3 className="font-semibold text-lg">{item?.name}</h3>
                                                                    <p className={`w-fit h-6 text-white text-sm px-2 rounded-lg ${isActive?'bg-green-500':'bg-red-500'}`}>
                                                                        {item?.status}
                                                                    </p>
                                                                </div>
                                                                {item.contact && (
                                                                    <address className="text-[14px] md:text-base not-italic">
                                                                        <a href={`tel:+63 ${item.contact?.substring(1)}`}>
                                                                            +63 {item.contact?.substring(1)}
                                                                        </a>
                                                                    </address>
                                                                )}
                                                                {/* display only for small screen */}
                                                                <p className="flex md:hidden text-[14px]">
                                                                    {formattedDateAndTime(new Date(item?.updatedAt))}
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-col md:items-end md:justify-start">
                                                                <div className="relative size-[26px] rounded-lg hover:cursor-pointer hover:bg-gray-200">
                                                                    <button onClick={(ev) => {
                                                                            ev.stopPropagation();
                                                                            setSupplierActions(state => state.map((_, i) => i===index))
                                                                        }}
                                                                        className="z-0"
                                                                    >
                                                                        <Ellipsis />
                                                                    </button>
                                                                    <article className={`absolute right-0 z-10 text-sm bg-white rounded-lg border shadow-lg p-1 ${supplierActions[index]?'block':'hidden'}`}>
                                                                        <button
                                                                            onClick={() => {
                                                                                actionId.current = item?.id;
                                                                                setEnablePrompt(true)} 
                                                                            }
                                                                            className={`w-full text-start hover:bg-gray-100 p-1 rounded-lg ${isActive?'opacity-50':'opacity-100'}`}
                                                                            disabled={isActive}
                                                                        >
                                                                            Enable
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                actionId.current = item?.id;
                                                                                setDisablePrompt(true)} 
                                                                            }
                                                                            className={`w-full text-start hover:bg-gray-100 p-1 rounded-lg ${!isActive?'opacity-50':'opacity-100'}`}
                                                                            disabled={!isActive}
                                                                        >
                                                                            Disable
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                if(isActive) {
                                                                                    const {id, name, contact, image, status} = item;
                                                                                    zSupplier.getState()?.saveSupplierData(id, name, contact, image, status);
                                                                                    navigate('/admin/update-supplier');
                                                                                }
                                                                            }}
                                                                            className={`w-full text-start hover:bg-gray-100 p-1 rounded-lg ${!isActive?'opacity-50':'opacity-100'}`}
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
                                <h3>No Suppliers found</h3>
                            </div>
                        )
                    }
                </div>
            </section>
        </main>
    );
}

export default Supplier;
