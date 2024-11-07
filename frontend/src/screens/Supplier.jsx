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
    const [supplierActions, setSupplierActions] = useState([]);
    const [disablePrompt, setDisablePrompt] = useState(false);
    const [enablePrompt, setEnablePrompt] = useState(false);
    const [loading, setLoading] = useState(false);

    const actionId = useRef(null);
    const navigate = useNavigate();

    const changeSupplierStatus = async (changeTo) => {
        try {
            setLoading(true);
            if(changeTo==='active') setEnablePrompt(false);
            else if(changeTo==='inactive') setDisablePrompt(false);
            else throw new Error('Error status type is undefined');

            if(!actionId.current) throw new Error('Supplier not recognized');

            const payload = {id: actionId.current, changeTo};
            const response = await sendJSON(urls?.updatesupplierstatus, payload, 'PUT');
            if(response) {
                console.log(response?.message || '');
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
                //console.log(response?.result);
                const data = response?.result || [];
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
        getSuppliers();

        const closeActions = () => setSupplierActions(state => state.map(item => false));
        addEventListener('click', closeActions);
        return () => {
            removeEventListener('click', closeActions);
        }
    }, []);

    if(disablePrompt) {
        return (
            <Prompt header="Are you sure you want to disable this supplier?" message="Disabled suppliers will not be available for new transactions but can still be viewed in the system." callback={()=>changeSupplierStatus('inactive')} onClose={()=>setDisablePrompt(false)} />
        )
    }

    if(enablePrompt) {
        return (
            <Prompt header="Would you like to enable this supplier?" message="Once enabled, they will be available for new transactions." callback={()=>changeSupplierStatus('active')} onClose={()=>setEnablePrompt(false)} />
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
                <h1 className="hidden sm:flex font-semibold text-lg">Supplier</h1>
                <Searchbar />
                <Link
                    to="/admin/new-supplier"
                    className="flex gap-2 items-center justify-center leading-none bg-green-600 text-white font-bold rounded-full p-2 sm:pr-4 hover:bg-green-800"
                >
                    <Plus />
                    <span className="hidden sm:flex text-nowrap">New Supplier</span>
                </Link>
            </section>
            <h1 className="flex sm:hidden font-semibold text-lg">Supplier</h1>
            <div className="grow w-full h-full relative">
                <div className="w-full absolute top-0 left-0 right-0 bottom-0 bg-white mt-2 rounded-lg shadow-md">
                    {
                        suppliers?.length > 0 ? (
                            <ul className="flex flex-col gap-2 p-2">
                                {
                                    suppliers.map((item, index) => {
                                        const isActive = item?.status==='active';
                                        return (
                                            <li key={item?.id}>
                                                <div className="flex p-1 border border-neutral-300 rounded-lg">
                                                    <img 
                                                        src={`${apiUrl}/suppliers/${item?.image}`} 
                                                        alt="ovida-supplier" 
                                                        className="size-[80px] rounded-lg border"
                                                    />
                                                    <div className="w-full h-[80px] flex justify-between p-2">
                                                        <div className="flex flex-col">
                                                            <div className="flex justify-center items-center gap-2">
                                                                <h3 className="font-semibold text-lg">{item?.name}</h3>
                                                                <p className={`h-6 text-white text-sm px-2 rounded-full ${isActive?'bg-green-500':'bg-red-500'}`}>{item?.status}</p>
                                                            </div>
                                                            <p>{item?.contact}</p>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <div className="relative size-[26px] rounded-full hover:cursor-pointer hover:bg-gray-200">
                                                                <button onClick={(ev) => {
                                                                        ev.stopPropagation();
                                                                        setSupplierActions(state => state.map((_, i) => i===index))
                                                                    }}
                                                                    className="z-0"
                                                                >
                                                                    <Ellipsis />
                                                                </button>
                                                                <article className={`absolute right-0 z-10 text-sm bg-white rounded-lg border p-1 ${supplierActions[index]?'block':'hidden'}`}>
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
                                                                                const {id, name, contact, image, status} = item;
                                                                                zSupplier.getState()?.saveSupplierData(id, name, contact, image, status);
                                                                                navigate('/admin/update-supplier');
                                                                            }
                                                                        }}
                                                                        className={`w-full hover:bg-gray-100 p-1 rounded-lg ${!isActive?'opacity-50':'opacity-100'}`}
                                                                        disabled={!isActive}
                                                                    >
                                                                            Update
                                                                        </button>
                                                                </article>
                                                            </div>
                                                            <p>{formattedDateAndTime(new Date(item?.createdAt))}</p>
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
                                <h3>No Suppliers Found</h3>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
}

export default Supplier;