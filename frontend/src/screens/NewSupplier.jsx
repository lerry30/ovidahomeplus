import { useState } from 'react';
import { sendForm } from '@/utils/send';
import { urls } from '@/constants/urls';
import { useNavigate, Link } from 'react-router-dom';
import { contactNumberInput } from '@/utils/contact';
import { ChevronLeft } from 'lucide-react';

import AppLogo from '@/components/AppLogo';
import ImageUpload from '@/components/ImageUpload';
import Loading from '@/components/Loading';
import ErrorField from '@/components/ErrorField';
import TitleFormat from '@/utils/titleFormat';

const NewSupplier = () => {
    const [data, setData] = useState({name: '', contact: ''});
    const [image, setImage] = useState(undefined);
    const [errorData, setErrorData] = useState({name: '', contact: '', default: ''});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const supplier = async () => {
        try {
            setLoading(true);

            const name = data?.name?.trim();
            const contact = data?.contact?.trim();

            if(!name) {
                setErrorData(state => ({...state, name: 'Supplier name is empty.'}));
                throw new Error('All fields are required.');
            }

            const form = new FormData();
            form.append('name', TitleFormat(name));
            form.append('contact', contact);
            form.append('file', image);

            const response = await sendForm(urls?.newsupplier, form);
            if(response) {
                console.log(response?.message);
                navigate('/admin/suppliers');
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
        const digits = contactNumberInput(input);
        setData(state => ({...state, contact: digits}))
    }

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
                    <AppLogo segment="/suppliers" />
                </div>
                <h1 className="md:absolute md:left-1/2 md:-translate-x-1/2 font-bold text-lg md:text-2xl px-4">Create New Supplier</h1>
            </header>
            <main className="grid grid-cols-1 lg:grid-cols-4 gap-2 bg-neutral-100 p-4">    
                <section className="bg-white rounded-md p-4">
                    <ImageUpload fileData={[image, setImage]} className="size-[100px]" />
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
                            to="/admin/suppliers" 
                            className="flex items-center justify-center leading-none font-bold rounded-full p-4 text-white bg-gray-500 hover:bg-gray-600"
                        >
                            Cancel
                        </Link>
                        <button 
                            onClick={supplier} 
                            className="flex items-center justify-center leading-none bg-green-600 text-white font-bold rounded-full p-4 hover:bg-green-800"
                        >
                            Add Supplier
                        </button>
                    </div>
                    <ErrorField message={errorData?.default || ''} />
                </section>
            </main>
        </div>
    )
}

export default NewSupplier;
