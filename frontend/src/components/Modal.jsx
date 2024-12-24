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
                            className="cursor-pointer rounded-lg group-hover:bg-neutral-800/50 group-hover:stroke-neutral-200 stroke-neutral-500/75" 
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
            <div className="card p-8 bg-zinc-100 rounded-md shadow-lg shadow-black border border-rose-700 flex flex-col">
                <article className="w-full relative">
                    <div onClick={ closeModal } className="group absolute top-[-20px] right-[-20px]">
                        <X
                            onClick={ closeModal }
                            className="cursor-pointer rounded-lg group-hover:bg-neutral-800/50 group-hover:stroke-neutral-200 stroke-neutral-500/75" 
                        />
                    </div>
                </article>
                
                <h1 className="font font-headings font-bold text-2xl pt-2">{ header }</h1>
                <p className="font-paragraphs w-60 py-4 text-center text-neutral-800">{ message }</p>
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
                            className="cursor-pointer rounded-lg group-hover:bg-neutral-800/50 group-hover:stroke-neutral-200 stroke-neutral-500/75" 
                        />
                    </div>
                </article>
                
                <h1 className="font-headings font-bold text-2xl pt-2 max-w-80 text-center">{ header }</h1>
                <p className="font-paragraphs w-80 py-4 text-center text-neutral-800">{ message }</p>
                <div className="w-full justify-end flex gap-2 mt-2">
                    <button onClick={ callback } className="font-headings bg-[#080] text-white px-4 py-1 leading-none rounded-lg text-[16px]">Yes</button>
                    <button onClick={ closeModal } className="font-headings bg-neutral-500/45 p-2 leading-none rounded-lg text-[16px]">Cancel</button>
                </div>
            </div>
        </div>
    );
}

export const PromptTextBox = ({ header, message, callback, onClose }) => {
    const textBoxRef = useRef(null);
    const modalRef = useRef(null);
    const [textBoxError, setTextBoxError] = useState('');

    const send = async (ev) => {
        try {
            ev.preventDefault();
            const textarea = textBoxRef.current;
            if(!textarea?.value) {
                setTextBoxError(`Please fill in the box with the ${ header?.trim()?.toLowerCase() }.`);
                return;
            }

            if(textarea?.value?.length > 200) {
                setTextBoxError('Max 200 characters, please be concise.');
                return;
            }

            await callback(textarea?.value);
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
            <div className="card w-full sm:w-[500px] p-8 bg-zinc-100 rounded-md shadow-lg shadow-black border border-emerald-500 flex flex-col">
                <h1 className="font-headings font-bold text-2xl pt-2">{ header }</h1>
                <p className="font-paragraphs py-4 text-neutral-800">{ message }</p>

                <textarea 
                    ref={textBoxRef} 
                    name="textbox" 
                    className="input w-full min-h-[120px] outline-none border-[1px] border-neutral-400 font-paragraphs p-2"
                ></textarea>
                <ErrorField message={textBoxError} />

                <div className="w-full justify-end flex gap-2 mt-2">
                    <button onClick={closeModal} className="font-headings bg-neutral-500/45 p-2 leading-none rounded-lg text-[16px]">Cancel</button>
                    <button onClick={send} className="font-headings bg-[#080] text-white px-4 py-1 leading-none rounded-lg text-[16px]">Submit</button>
                </div>
            </div>
        </div>
    );
}

export const PromptInput = ({ header, message, callback, onClose }) => {
    const [textInput, setTextInput] = useState('');
    const [inputError, setInputError] = useState('');
    const modalRef = useRef(null);

    const send = async (ev) => {
        try {
            ev.preventDefault();
            if(!textInput) {
                setInputError(`Please fill in the input field with the ${ header?.trim()?.toLowerCase() }.`);
                return;
            }

            if(textInput?.length > 200) {
                setInputError('Max 200 characters, please be concise.');
                return;
            }

            await callback(textInput);
        } catch(error) {
            setInputError(error?.message || 'There\'s something wrong.');
        }
    }

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
                            className="cursor-pointer rounded-lg group-hover:bg-neutral-800/50 group-hover:stroke-neutral-200 stroke-neutral-500/75" 
                        />
                    </div>
                </article>
                
                <h1 className="font-headings font-bold text-2xl pt-2 max-w-80">{header}</h1>
                <p className="font-paragraphs w-80 py-4 text-neutral-800">{message}</p>

                <input
                    value={textInput}
                    onChange={elem => {
                        const input = elem.target.value.trim();
                        setTextInput(input);
                    }}
                    className="max-w-96 outline-none border-2 border-neutral-400 rounded-lg py-2 px-4" 
                    placeholder="Item Code"
                    required
                />
                <ErrorField message={inputError || ''} />

                <div className="w-full justify-end flex gap-2 mt-2">
                    <button onClick={closeModal} className="font-headings bg-neutral-500/45 p-2 leading-none rounded-lg text-[16px]">Cancel</button>
                    <button onClick={send} className="font-headings bg-green-600 text-white px-4 py-1 leading-none rounded-lg text-[16px]">Done</button>
                </div>
            </div>
        </div>
    );
}

export const PromptCheckBoxes = ({ header, message, callback, onClose, list=[], checked=[] }) => {
    const [checkedBoxes, setCheckedBoxes] = useState(checked);
    const modalRef = useRef(null);

    const done = () => {
        if(checkedBoxes?.length === 0) return;
        callback(checkedBoxes);
    }

    const check = (checkedItem) => {
        if(checkedBoxes?.includes(checkedItem)) {
            setCheckedBoxes(state => state?.filter(item => item!==checkedItem));
            return;
        }
        setCheckedBoxes([...checkedBoxes, checkedItem]);
    }

    const closeModal = () => {
        modalRef.current.style.display = 'none';
        onClose();
    }

    return (
        <div ref={ modalRef } className="w-screen h-screen fixed top-0 left-0 bg-neutral-800/90 z-50 flex justify-center items-center backdrop-blur-sm">
            <div className="card p-10 bg-zinc-100 rounded-md shadow-lg shadow-black border border-emerald-500 flex flex-col">
                <article className="w-full relative">
                    <div onClick={closeModal} className="group absolute top-[-20px] right-[-20px]">
                        <X
                            onClick={closeModal}
                            className="cursor-pointer rounded-lg group-hover:bg-neutral-800/50 group-hover:stroke-neutral-200 stroke-neutral-500/75" 
                        />
                    </div>
                </article>
                
                <h1 className="font-headings font-bold text-2xl pt-2 max-w-80">{header}</h1>
                <p className="font-paragraphs w-80 py-4 text-neutral-800">{message}</p>

                <div className="w-[70vw] max-h-[60vh] flex flex-wrap gap-2
                    overflow-x-hidden overflow-y-auto
                    [&::-webkit-scrollbar]:w-2 pr-1
                    [&::-webkit-scrollbar-track]:rounded-lg
                    [&::-webkit-scrollbar-track]:bg-gray-300
                    [&::-webkit-scrollbar-thumb]:rounded-lg
                    [&::-webkit-scrollbar-thumb]:bg-gray-400">
                    {list?.length > 0 && (
                        list.map((item, index) => {
                            const isChecked = checkedBoxes.includes(item);
                            return (
                                <article key={index} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="size-5"
                                        checked={isChecked}
                                        onChange={() => check(item)}
                                    />
                                    <span>{item}</span>
                                </article>
                            )   
                        }
                    ))}
                </div>

                <div className="w-full justify-end flex gap-2 mt-4">
                    <button 
                        onClick={closeModal} 
                        className="font-headings bg-neutral-500/45 p-2 leading-none rounded-lg text-[16px]"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={done} 
                        className={`font-headings bg-green-600 text-white px-4 py-1 leading-none rounded-lg text-[16px] 
                            ${checkedBoxes?.length===0 ? 'pointer-events-none opacity-80' : ''}`}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
