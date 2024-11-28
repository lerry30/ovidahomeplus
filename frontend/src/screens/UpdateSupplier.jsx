import { useLayoutEffect, useState } from 'react';
import { sendForm } from '@/utils/send';
import { urls, apiUrl } from '@/constants/urls';
import { useNavigate, Link } from 'react-router-dom';
import { zSupplier } from '@/store/supplier';
import { toNumber } from '@/utils/number';

import AppLogo from '@/components/AppLogo';
import ImageUpload from '@/components/ImageUpload';
import Loading from '@/components/Loading';
import ErrorField from '@/components/ErrorField';
import TitleFormat from '@/utils/titleFormat';

const UpdateSupplier = () => {
    const currentName = zSupplier(state => state?.name);
    const currentContact = zSupplier(state => state?.contact);
    const currentImage = zSupplier(state => state?.image);

    const [data, setData] = useState({name: currentName, contact: currentContact});
    const [image, setImage] = useState(null);
    const [errorData, setErrorData] = useState({name: '', contact: '', default: ''});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // update supplier
    const supplier = async () => {
        try {
            setLoading(true);

            const id = toNumber(zSupplier.getState()?.id);
            const name = data?.name?.trim();
            const contact = data?.contact?.trim();

            if(!id || id===0) navigate('/admin/supplier');

            if(!name) {
                setErrorData(state => ({...state, name: 'Supplier name is empty.'}));
                throw new Error('All fields are required.');
            }

            const form = new FormData();
            form.append('id', id);
            form.append('name', TitleFormat(name));
            form.append('contact', contact);
            form.append('file', image);

            const response = await sendForm(urls?.updatesupplier, form, 'PUT');
            if(response) {
                console.log(response?.message);
                navigate('/admin/supplier');
            }
        } catch(error) {
            console.log(error);
            setErrorData(state => ({...state, default: error?.message}));
        } finally {
            setLoading(false);
        }
    }

    const handleContactNumberInput = (elem) => {
        const input = elem.target.value?.trim();
        // Remove all non-numeric characters
        let digits = input.replace(/\D/g, '');
        // Restrict to a maximum of 11 digits
        if (digits.length > 11) {
            digits = digits.substring(0, 11);
        }
    
        // Format only if the digits start with '09' and have at least 4 digits
        if (digits.length >= 4 && digits.startsWith('09')) {
            digits = digits.replace(/(\d{4})(\d{3})?(\d{4})?/, (match, p1, p2, p3) => {
                if (p2 && p3) {
                    return `${p1}-${p2}-${p3}`;
                } else if (p2) {
                    return `${p1}-${p2}`;
                } else {
                    return p1;
                }
            });
        }
        
        setData(state => ({...state, contact: digits}))
    }

    useLayoutEffect(() => {
        zSupplier.getState()?.reloadSupplierData();
    }, []);

    if(loading) {
        return (
            <Loading customStyle="w-full h-screen" />
        )
    }

    return (
        <div className="w-full min-h-screen py-4 px-4 md:px-10 lg:px-30 xl:px-40">
            <header className="w-full h-[70px] flex items-center mb-2">
                <div className="hidden md:flex">
                    <AppLogo segment="/suppliers" />
                </div>
                <h1 className="md:absolute md:left-1/2 md:-translate-x-1/2 font-bold text-lg md:text-2xl px-4">Update Supplier</h1>
            </header>
            <main className="grid grid-cols-1 lg:grid-cols-4 gap-2 bg-neutral-100 p-4">    
                <section className="bg-white rounded-md p-4">
                    <ImageUpload 
                        fileData={[image, setImage]} 
                        initialImageSrc={`${apiUrl}/suppliers/${currentImage}`} 
                        className="size-[100px]" 
                    />
                </section>
                <section className="lg:col-start-2 lg:col-span-3 bg-white rounded-md p-4 flex flex-col gap-2">
                    <h3 className="font-bold text-lg">Supplier Details</h3>
                    <hr />
                    <div className="flex flex-col sm:px-4 gap-2">
                        <label htmlFor="supplier-name" className="font-semibold">
                            Supplier Name
                            <span className="text-red-500">*</span>
                        </label>
                        <input 
                            id="supplier-name"
                            value={data?.name}
                            onChange={elem => setData(state => ({...state, name: elem.target.value}))}
                            className="max-w-96 outline-none border-2 border-neutral-400 rounded-full py-2 px-4" 
                            placeholder="Supplier Name"
                            required
                        />
                        <ErrorField message={errorData?.name || ''} />
                    </div>
                    <div className="flex flex-col sm:px-4 gap-2">
                        <label htmlFor="supplier-name" className="font-semibold">Supplier Contact</label>
                        <input 
                            id="supplier-name"
                            value={data?.contact}
                            onChange={handleContactNumberInput}
                            className="max-w-96 outline-none border-2 border-neutral-400 rounded-full py-2 px-4" 
                            placeholder="09XX-XXX-XXXX (Optional)"
                        />
                    </div>
                    <div className="sm:px-4 sm:py-2 flex gap-2">
                        <Link 
                            to="/admin/supplier" 
                            className="flex items-center justify-center leading-none font-bold rounded-full p-4 text-white bg-gray-500 hover:bg-gray-600"
                        >
                            Cancel
                        </Link>
                        <button 
                            onClick={supplier} 
                            className="flex items-center justify-center leading-none bg-green-600 text-white font-bold rounded-full p-4 hover:bg-green-800"
                        >
                            Update Supplier
                        </button>
                    </div>
                    <ErrorField message={errorData?.default || ''} />
                </section>
            </main>
        </div>
    )
}

export default UpdateSupplier;