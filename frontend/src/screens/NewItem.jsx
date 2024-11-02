import { useState } from 'react';

import AppLogo from '@/components/AppLogo';
import ImageUpload from '@/components/ImageUpload';

const NewItem = () => {
    const [image, setImage] = useState(undefined);

    return (
        <div className="w-full min-h-screen py-4 px-40">
            <header className="w-full h-[70px] flex items-center mb-2">
                <AppLogo />
                <h1 className="absolute left-1/2 -translate-x-1/2 font-bold text-2xl px-4">Create New Product</h1>
            </header>
            <main className="grid grid-cols-4 gap-4 bg-neutral-100 p-4">
                <section className="bg-white rounded-md p-4">
                    <ImageUpload fileData={[image, setImage]} className="size-[100px]" />
                </section>
                <section className="col-span-3 bg-white rounded-md p-4">
                    <h3>Product Type</h3>
                    <hr />
                </section>
                <section className="col-start-2 col-span-3 bg-white rounded-md p-4">
                    <h3>Product Details</h3>
                    <hr />
                </section>
            </main>
        </div>
    )
}

export default NewItem;