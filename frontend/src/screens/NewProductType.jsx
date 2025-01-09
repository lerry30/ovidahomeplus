import { useState } from 'react';
import { sendForm } from '@/utils/send';
import { urls } from '@/constants/urls';
import { useNavigate, Link } from 'react-router-dom';

import ImageUpload from '@/components/ImageUpload';
import SidebarLayout from '@/components/Sidebar';
import Loading from '@/components/Loading';
import ErrorField from '@/components/ErrorField';
import TitleFormat from '@/utils/titleFormat';

const NewProductType = () => {
    const [data, setData] = useState({name: ''});
    const [image, setImage] = useState(undefined);
    const [errorData, setErrorData] = useState({name: '', default: ''});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const productType = async () => {
        try {
            setLoading(true);

            const name = data?.name?.trim();
            if(!name) {
                setErrorData(state => ({...state, name: 'Product type name is empty.'}));
                throw new Error('All fields are required.');
            }

            const form = new FormData();
            form.append('name', TitleFormat(name));
            form.append('file', image);

            const response = await sendForm(urls?.newproducttype, form);
            if(response) {
                console.log(response?.message);
                navigate('/admin/product-types');
            }
        } catch(error) {
            console.log(error);
            setErrorData(state => ({...state, default: error?.message}));
        } finally {
            setLoading(false);
        }
    }

    if(loading) {
        return (
            <Loading customStyle="w-full h-screen" />
        )
    }

        /*<div className="w-full min-h-screen py-4 px-4 md:px-10 lg:px-30 xl:px-40">
            <header className="w-full h-[70px] flex items-center mb-2">
                <Link to="/admin" className="md:hidden flex justify-center items-center text-sm">
                    <ChevronLeft />
                    back
                </Link>
                <div className="hidden md:flex">
                    <AppLogo segment="/product-types" />
                </div>
                <h1 className="md:absolute md:left-1/2 md:-translate-x-1/2 font-bold text-lg md:text-2xl px-4">Create New Product Type</h1>
            </header>*/
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
                        Create New Product Type
                    </h1>
                </header>
                <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-2 bg-neutral-100 pt-2">
                    <section className="bg-white rounded-md p-4">
                        <ImageUpload fileData={[image, setImage]} className="size-[100px]" />
                    </section>
                    <section className="lg:col-start-2 lg:col-span-3 bg-white rounded-md p-4 flex flex-col gap-2">
                        <h3 className="font-bold text-lg">Product Type Details</h3>
                        <hr />
                        <div className="flex flex-col sm:px-4 gap-2">
                            <label htmlFor="product-type-name" className="font-semibold">
                                Product Type Name
                                <span className="text-red-500">*</span>
                            </label>
                            <input 
                                id="product-type-name"
                                value={data?.name}
                                onChange={elem => setData(state => ({...state, name: elem.target.value}))}
                                className="max-w-96 outline-none border-2 border-neutral-400 rounded-lg py-2 px-4" 
                                placeholder="Product Type"
                                required
                            />
                            <ErrorField message={errorData?.name || ''} />
                        </div>
                        <div className="sm:px-4 sm:py-2 flex gap-2">
                            <Link 
                                to="/admin/product-types" 
                                className="flex items-center justify-center leading-none font-bold rounded-lg p-4 text-white bg-gray-500 hover:bg-gray-600"
                            >
                                Cancel
                            </Link>
                            <button 
                                onClick={productType} 
                                className="flex items-center justify-center leading-none bg-green-600 text-white font-bold rounded-lg p-4 hover:bg-green-800"
                            >
                                Add Product Type
                            </button>
                        </div>
                        <ErrorField message={errorData?.default || ''} />
                    </section>
                </div>
            </main>
        </div>
    )
}

export default NewProductType;
