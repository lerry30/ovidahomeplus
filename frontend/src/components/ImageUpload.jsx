import { Image } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { toNumber } from '@/utils/number';

const imageMimeType = /image\/(png|jpg|jpeg)/i;

const ImageUpload = ({fileData: [file, setFile], initialImageSrc=undefined, className=''}) => {
    const inputFileRef = useRef();
    const containersSize = useRef('');
    const [ imageSrc, setImageSrc ] = useState(null);

    // tooltip
    const uploadBtn = useRef(null);
    const toolTip = useRef(null);

    const toolTipOverMouse = (ev) => {
        const mouseX = ev?.clientX || 0;
        const mouseY = ev?.clientY || 0;

        const contProps = uploadBtn?.current?.getBoundingClientRect() || {};
        const contX = contProps?.x || 0;
        const contY = contProps?.y || 0;

        const x = mouseX - contX - 10;
        const y = mouseY - contY + 20;

        toolTip.current.style.left = `${ x }px`;
        toolTip.current.style.top = `${ y }px`;
    }

    const onFileChangeCapture = (ev) => {
        const fileToUpload = ev.target.files[0];
        if(!fileToUpload.type.match(imageMimeType)) return;
        setFile(fileToUpload);
    }

    useEffect(() => {
        let fileReader, isCancel = false;
        if(file) {
            fileReader = new FileReader();
            fileReader.onload = (e) => {
                const { result } = e.target;
                if (result && !isCancel) {
                    setImageSrc(result)
                }
            }

            fileReader.readAsDataURL(file);
        }

        return () => {
            isCancel = true;
            if (fileReader && fileReader.readyState === 1) {
                fileReader.abort();
            }
        }
    }, [file]);

    useEffect(() => {
        // initial image source
        if(!imageSrc && initialImageSrc)
            setImageSrc(initialImageSrc);

        const matchedClassSize = className?.match(/size-(\w+)/gi) || [];
        const classSize = matchedClassSize.length > 0 ? matchedClassSize[0] : 'size-full';
        const size = toNumber(classSize.split('-')[1]);
        containersSize.current = classSize;
        if(size > 0)
            containersSize.current = `size-[${ size * 4 + 100 }px]`;

        // tooltip
        uploadBtn?.current?.addEventListener('mousemove', toolTipOverMouse);
        return () => uploadBtn?.current?.removeEventListener('mousemove', toolTipOverMouse);
    }, []);

    return (
        <div className={ containersSize.current }> 
            <label htmlFor="file" className="pl-1 font-paragraphs">Click to browse image</label>
            <div 
                ref={ uploadBtn }
                onClick={ () => inputFileRef.current.click() }
                className={`size-44 flex justify-center items-center rounded-md border-4 border-gray-400 border-dashed cursor-pointer relative group ${className}`}>
                {
                    imageSrc ? 
                        <img
                            src={ imageSrc }
                            alt="Preview Image"
                            className="w-full h-full object-contain rounded-md"
                            onError={ev => {
                                ev.target.src='../../public/image-off.png'
                                ev.onerror=null;
                            }}
                        />
                    :
                        <Image size={40} color="#9ca3af" />
                }
                {/* tooltip */}
                <div ref={ toolTip } className="absolute top-full mt-2 bg-neutral-700 px-2 py-1 rounded-md text-white hidden group-hover:flex">
                    <span className="text-sm">Upload Image</span>
                    <div className="size-2 absolute top-0 -mt-[2px] z-0 rotate-45 bg-neutral-700"></div>
                </div>
            </div>
            <input type="file" name="file" id="file" className="hidden" ref={ inputFileRef } onChange={ onFileChangeCapture } accept="image/*"/>
        </div>
    );
}

export default ImageUpload;