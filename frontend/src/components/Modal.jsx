import { X } from 'lucide-react'
import { useRef, useState } from 'react';
import ErrorField from './ErrorField';

export const SuccessModal = ({ message, callback }) => {
    const modalRef = useRef();

    const closeModal = () => {
        modalRef.current.style.display = 'none';
        callback();
    }

    return (
        <div ref={ modalRef } className="w-screen h-screen fixed top-0 left-0 bg-neutral-800/90 z-50 flex justify-center items-center backdrop-blur-sm">
            <div className="card p-16 bg-zinc-100 rounded-md shadow-lg shadow-black border border-emerald-500 flex flex-col">
                <article className="w-full relative">
                    <div onClick={ closeModal } className="group absolute top-[-20px] right-[-20px]">
                        <X
                            onClick={ closeModal }
                            className="cursor-pointer rounded-full group-hover:bg-neutral-800/50 group-hover:stroke-neutral-200 stroke-neutral-500/75" 
                        />
                    </div>
                </article>
                
                <h1 className="font font-headings font-bold text-2xl">Success!</h1>
                <p className="font-paragraphs w-60 py-4 text-center text-neutral-800">{ message }</p>
            </div>
        </div>
    );
}

export const ErrorModal = ({ header, message, callback }) => {
    const modalRef = useRef();

    const closeModal = () => {
        modalRef.current.style.display = 'none';
        callback();
    }

    return (
        <div ref={ modalRef } className="w-screen h-screen fixed top-0 left-0 bg-neutral-800/90 z-50 flex justify-center items-center">
            <div className="card p-16 bg-zinc-100 rounded-md shadow-lg shadow-black border border-rose-700 flex flex-col">
                <article className="w-full relative">
                    <div onClick={ closeModal } className="group absolute top-[-20px] right-[-20px]">
                        <X
                            onClick={ closeModal }
                            className="cursor-pointer rounded-full group-hover:bg-neutral-800/50 group-hover:stroke-neutral-200 stroke-neutral-500/75" 
                        />
                    </div>
                </article>
                
                <h1 className="font font-headings font-bold text-2xl pt-2">{ header }</h1>
                <p className="font-paragraphs w-60 py-4 text-center text-neutral-800 dark:text-neutral-400">{ message }</p>
            </div>
        </div>
    );
}

export const Prompt = ({ header, message, callback, onClose }) => {
    const modalRef = useRef();

    const closeModal = () => {
        modalRef.current.style.display = 'none';
        onClose();
    }

    return (
        <div ref={ modalRef } className="w-screen h-screen fixed top-0 left-0 bg-neutral-800/90 z-50 flex justify-center items-center backdrop-blur-sm">
            <div className="card p-10 bg-zinc-100 rounded-md shadow-lg shadow-black border border-emerald-500 flex flex-col">
                <article className="w-full relative">
                    <div onClick={ closeModal } className="group absolute top-[-20px] right-[-20px]">
                        <X
                            onClick={ closeModal }
                            className="cursor-pointer rounded-full group-hover:bg-neutral-800/50 group-hover:stroke-neutral-200 stroke-neutral-500/75" 
                        />
                    </div>
                </article>
                
                <h1 className="font-headings font-bold text-2xl pt-2 max-w-80 text-center">{ header }</h1>
                <p className="font-paragraphs w-80 py-4 text-center text-neutral-800">{ message }</p>
                <div className="w-full justify-end flex gap-2 mt-2">
                    <button onClick={ callback } className="font-headings bg-neutral-500/45 px-4 py-1 leading-none rounded-full text-[16px]">Yes</button>
                    <button onClick={ closeModal } className="font-headings bg-neutral-500/45 p-2 leading-none rounded-full text-[16px]">Cancel</button>
                </div>
            </div>
        </div>
    );
}

export const PromptTextBox = ({ header, message, callback, onClose }) => {
    const modalRef = useRef();
    const [ textBoxError, setTextBoxError ] = useState('');

    const send = async (ev) => {
        try {
            ev.preventDefault();

            const form = ev?.target;
            const textarea = form?.querySelector('textarea');
            if(!textarea?.value) {
                setTextBoxError(`Please fill in the box with the ${ header?.trim()?.toLowerCase() }.`);
                return;
            }

            if(textarea?.value?.length > 200) {
                setTextBoxError('Max 200 characters, please be concise.');
                return;
            }

            await callback(form);
        } catch(error) {
            setTextBoxError(error?.message || 'There\'s something wrong.');
        }
    }
    
    const closeModal = () => { 
        modalRef.current.style.display = 'none';
        onClose();
    }

    return (
        <div ref={ modalRef } className="w-screen h-screen fixed top-0 left-0 bg-neutral-800/90 z-50 flex justify-center items-center backdrop-blur-sm">
            <div className="card w-full sm:w-[500px] p-16 bg-zinc-100 rounded-md shadow-lg shadow-black border border-emerald-500 flex flex-col">
                <h1 className="font-headings font-bold text-2xl pt-2 text-center">{ header }</h1>
                <p className="font-paragraphs py-4 text-center text-neutral-800">{ message }</p>

                <form onSubmit={ send } className="w-full">
                    <textarea name="textbox" className="input w-full min-h-[140px] outline-none border-[1px] border-neutral-400 font-paragraphs"></textarea>
                    <ErrorField message={ textBoxError } />

                    <div className="w-full justify-end flex gap-2 mt-2">
                        <button onClick={ closeModal } className="font-headings bg-neutral-500/45 p-2 leading-none rounded-full text-[16px]">Cancel</button>
                        <button type="submit" className="font-headings bg-neutral-500/45 px-4 py-1 leading-none rounded-full text-[16px]">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
}