import { PanelTopClose } from 'lucide-react';
import { SuccessModal } from '@/components/Modal';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useLayoutEffect } from 'react';
import { getData, sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';

import SidebarLayout from '@/components/Sidebar';
import CashInput from '@/components/CashInput';
import Loading from '@/components/Loading';

const UpdateCashDrawer = () => {
    const [data, setData] = useState({onethousand: 0, fivehundred: 0, twohundred: 0, onehundred: 0, fifty: 0, twenty: 0, ten: 0, five: 0, one: 0});
    const [tempData, setTempData] = useState({onethousand: 0, fivehundred: 0, twohundred: 0, onehundred: 0, fifty: 0, twenty: 0, ten: 0, five: 0, one: 0});
    const [isEdited, setIsEdited] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isUpdated, setIsUpdated] = useState(false);

    //const wordToNumberDenomination = {onethousand: 1000, fivehundred: 500, twohundred: 200, onehundred: 100, fifty: 50, twenty: 20, ten: 10, five: 5, one: 1};
    const navigate = useNavigate();

    const handleUpdateDenom = async () => {
        try {
            setLoading(true);
            const payload = {data};
            const response = await sendJSON(urls.updatecashdrawer, payload, 'PUT');
            if(response) {
                setIsUpdated(true);
            }
        } catch(error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const getCashDrawer = async () => {
        try {
            setLoading(true);
            const response = await getData(urls.cashdrawer);
            if(response) {
                const cashDenominations = response?.cashDenominations ?? {};
                const nDenominations = {};
                for(const key in cashDenominations) {
                    const denom = cashDenominations[key];
                    nDenominations[String(key).toLowerCase().trim()] = denom;
                }
                setData({...nDenominations});
                setTempData({...nDenominations});
            }
        } catch(error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        if(isUpdated) {
            setTimeout(() => {
                navigate('/admin/cash-denominations');
            }, 1000);
        }
    }, [isUpdated]);

    useLayoutEffect(() => {
        if(!isEdited) {
            for(const key in data) {
                const denom = data[key];
                if(tempData[key] !== denom) {
                    setIsEdited(true);
                    break;
                }
            }
        }
    }, [data]);

    useLayoutEffect(() => {
        getCashDrawer();    
    }, []);

    if(isUpdated) {
        return (
            <SuccessModal
                message="Updated successfully"
                callback={() => {}}
            />
        )
    }

    if(loading) {
        return (
            <Loading customStyle="w-full h-screen" />
        )
    }

    return (
        <div className="w-full min-h-screen">
            <SidebarLayout />
            <main className="absolute top-0 
                left-admin-sidebar-sm lg:left-admin-sidebar-lg 
                w-[calc(100vw-var(--admin-sidebar-width-sm))] lg:w-[calc(100vw-var(--admin-sidebar-width-lg))]
                h-full md:h-screen bg-neutral-100 p-2 sm:p-4
                flex flex-col overflow-y-auto
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-track]:rounded-lg
                [&::-webkit-scrollbar-track]:bg-gray-100
                [&::-webkit-scrollbar-thumb]:rounded-lg
                [&::-webkit-scrollbar-thumb]:bg-gray-300
                ">
                {/* Header Section */}
                <header className="w-full">
                    <h1 className="text-2xl font-bold text-gray-800">Update Cash Denominations</h1>
                </header>

                <section 
                    className="w-full flex bg-white py-4 px-6 flex-col rounded-lg lg:flex-row lg:px-4">
                    <div className="w-full flex flex-col p-2 gap-2 lg:pr-4">
                        <CashInput text="One Thousand" id="one-thousand" cash="onethousand" data={data} setData={setData} />
                        <CashInput text="Five Hundred" id="five-hundred" cash="fivehundred" data={data} setData={setData} />
                        <CashInput text="Two Hundred" id="two-hundred" cash="twohundred" data={data} setData={setData} />
                        <CashInput text="One Hundred" id="one-hundred" cash="onehundred" data={data} setData={setData} />
                        <CashInput text="Fifty" id="fifty" cash="fifty" data={data} setData={setData} />
                    </div>
                    <div className="w-full flex flex-col p-2 gap-4 lg:pl-4">
                        <CashInput text="Twenty" id="twenty" cash="twenty" data={data} setData={setData} />
                        <CashInput text="Ten" id="ten" cash="ten" data={data} setData={setData} />
                        <CashInput text="Five" id="five" cash="five" data={data} setData={setData} />
                        <CashInput text="One" id="one" cash="one" data={data} setData={setData} />
                    </div>
                </section>
                <section className="grow w-full flex justify-end gap-2 py-6 bg-white rounded-lg px-6">
                    {isEdited && (
                        <>
                            <Link 
                                to="/admin/cashier" 
                                className="h-fit flex items-center justify-center leading-none font-bold rounded-lg p-4 text-white bg-gray-500 hover:bg-gray-600">
                                Cancel
                            </Link>
                            <button
                                onClick={handleUpdateDenom}
                                className="h-fit flex gap-2 items-center justify-center leading-none font-bold rounded-lg p-3 
                                bg-green-600 text-white hover:bg-green-800"
                            >
                                <PanelTopClose /> 
                                <span className="hidden sm:flex text-nowrap">Edit Cash Drawer</span>
                            </button>
                        </>
                    )}
                </section>
            </main>
        </div>
    )
}

export default UpdateCashDrawer;
