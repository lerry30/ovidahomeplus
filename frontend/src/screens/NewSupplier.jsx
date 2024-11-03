import { useState } from 'react';

import AppLogo from '@/components/AppLogo';
import ImageUpload from '@/components/ImageUpload';

const NewSupplier = () => {
    const [image, setImage] = useState(undefined);

    return (
        <div className="w-full min-h-screen py-4 px-4 md:px-10 lg:px-30 xl:px-40">
            <header className="w-full h-[70px] flex items-center mb-2">
                <div className="hidden md:flex">
                    <AppLogo />
                </div>
                <h1 className="md:absolute md:left-1/2 md:-translate-x-1/2 font-bold text-lg md:text-2xl px-4">Create New Supplier</h1>
            </header>
            <main className="grid grid-cols-1 lg:grid-cols-4 gap-2 bg-neutral-100 p-4">    
                <section className="bg-white rounded-md p-4">
                    <ImageUpload fileData={[image, setImage]} className="size-[100px]" />
                </section>
                <section className="lg:col-start-2 lg:col-span-3 bg-white rounded-md p-4">
                    <h3 className="font-bold text-lg">Supplier Details</h3>
                    <hr />
                    <div className="flex flex-col sm:px-4 sm:py-2 gap-2">
                        <label htmlFor="supplier-name" className="font-semibold">Supplier Name</label>
                        <input id="supplier-name" className="max-w-96 outline-none border-2 border-neutral-400 rounded-full py-2 px-4" placeholder="Supplier Name"/>
                    </div>
                    <div className="flex flex-col sm:px-4 sm:py-2 gap-2">
                        <label htmlFor="supplier-name" className="font-semibold">Supplier Contact</label>
                        <input id="supplier-name" className="max-w-96 outline-none border-2 border-neutral-400 rounded-full py-2 px-4" placeholder="Supplier Contact"/>
                    </div>
                    <div className="sm:px-4 sm:py-2">
                        <button className="flex items-center justify-center leading-none bg-green-600 text-white font-bold rounded-full p-4 hover:bg-green-800">Add Supplier</button>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default NewSupplier;