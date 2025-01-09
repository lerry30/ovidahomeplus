import { ErrorModal } from '@/components/Modal';
import { useNavigate } from 'react-router-dom';
import { useLayoutEffect, useState, useRef } from 'react';
import { getData } from '@/utils/send';
import { urls } from '@/constants/urls';
import { zCashierSelectedItem } from '@/store/cashierSelectedItem';

import Quagga from 'quagga';
import SidebarLayout from '@/components/Sidebar';
import Loading from '@/components/Loading';

const QuaggaScanner = () => {
    const [scannedCode, setScannedCode] = useState(null);
    const [items, setItems] = useState({});
    const [barcodes, setBarcodes] = useState({});
    const [selectedItems, setSelectedItems] = useState({});
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState({header: '', message: ''});

    const scanned = useRef(false);
    const navigate = useNavigate();

    const initQuangga = () => {
        try{
            // Initialize Quagga when the component mounts
            Quagga.init({
                inputStream: {
                    name: 'Live',
                    type: 'LiveStream',
                    target: document.querySelector('#scanner-container'), // Attach to DOM element
                    constraints: {
                        width: window.innerWidth > 900 ? 900 : window.innerWidth - 50,
                        height: Math.min(window.innerHeight - 150, 600),
                        facingMode: 'environment', // Use rear camera
                    },
                },
                decoder: {
                    readers: ['code_128_reader', 'ean_reader', 'upc_reader'], // Add formats as needed
                },
                locate: true, // Enable locating for better detection
            }, (error) => {
                if (error) {
                    console.error('Error initializing camera for scanning barcode:', error);
                    setErrorMessage({
                        header: 'Barcode Scanner Issue',
                        message: 'There was an issue accessing the camera for scanning the barcode. Please ensure the camera is not being used by another app and try again.'
                    });
                    return;
                }
                console.log('Quagga initialized successfully.');
                Quagga.start();

            });
        } catch(error) {
            //console.log(error);
        }
    }

    const getItems = async () => {
        try {
            setLoading(true);

            const response = await getData(urls.getexclude); // exclude sold items
            if(response) {
                //console.log(response?.results);
                // filter data if it has 
                const data = response?.results;
                const fDataObj = {};
                for(const item of data) {
                    for(const barcode of item.barcodes) {
                        fDataObj[barcode.barcode] = item?.id;
                    }
                }
                setItems(data);
                setBarcodes(fDataObj);
            }
        } catch(error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    const stopCamera = () => {
        const videoElement = document.querySelector('#scanner-container video');
        if (videoElement) {
            const stream = videoElement.srcObject;
            if (stream) {
                const tracks = stream.getTracks();
                tracks.forEach((track) => track.stop()); // Stop all media tracks
                videoElement.srcObject = null; // Clear the video source
            }
        }
    }

    const cleanUp = () => {
        Quagga.offDetected(); // Remove event listener
        Quagga.stop(); // Stop the scanner
        stopCamera();
    }

    useLayoutEffect(() => {
        if(barcodes?.length === 0) return;
        initQuangga();
        // Cleanup when component unmounts
        return cleanUp;
    }, [barcodes]);

    useLayoutEffect(() => {
        // Handle detected barcode
        Quagga.onDetected((result) => {
            if (result && result.codeResult && result.codeResult.code) {
                const code = result.codeResult.code;

                setScannedCode(code); // Set the scanned barcode

                const itemId = barcodes[code];
                if(itemId && !scanned.current) {
                    scanned.current = true;

                    const isDiscounted = !!selectedItems[itemId]?.isDiscounted;
                    const selectedBarcodes = selectedItems[itemId]?.barcodes || [];
        
                    const newItem = {isDiscounted: isDiscounted, barcodes: [...selectedBarcodes, code]};
                    //setSelectedItems({...selectedItems});
                    zCashierSelectedItem.getState()?.saveSelectedItemData({...selectedItems, [itemId]: newItem});

                    Quagga.stop(); // Stop scanning after detection
                    stopCamera();
                    navigate('/admin/cashier');
                    //navigate(0); // it resolved my issue of open cam but it also reloads really fast the page causing the localstorage to be empty
                    setTimeout(() => navigate(0), 500);
                } else {
                    setBarcodes({...barcodes}); // reset
                }
            }
        });

        // Cleanup when component unmounts
        return cleanUp;
    }, [barcodes]);

    useLayoutEffect(() => {
        if(errorMessage?.header || errorMessage?.message) {
            setTimeout(() => {
                navigate('/admin/cashier');
            }, 3000);
        }

        return cleanUp;
    }, [errorMessage]);

    useLayoutEffect(() => {
        getItems();

        zCashierSelectedItem.getState()?.reloadSelectedItemData();
        const currentSelectedItems = zCashierSelectedItem.getState()?.items;
        if(currentSelectedItems) setSelectedItems(currentSelectedItems);

        // Cleanup when component unmounts
        return cleanUp;
    }, []);

    if(errorMessage?.header || errorMessage?.message) {
        return (
            <ErrorModal 
                header={errorMessage?.header}
                message={errorMessage?.message} 
                callback={() => setErrorMessage({header: '', message: ''})} 
            />
        )
    }

    if(loading) {
        return (
            <Loading customStyle="w-full h-screen" />
        )
    }

    return (
        <div className="w-full min-h-screen bg-neutral-50">
            <SidebarLayout />
            <main
                className="absolute top-0 left-admin-sidebar-sm lg:left-admin-sidebar-lg
                   w-[calc(100vw-var(--admin-sidebar-width-sm))] lg:w-[calc(100vw-var(--admin-sidebar-width-lg))]
                   h-full md:h-screen bg-neutral-100 p-4 flex flex-col overflow-y-auto
                   [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-lg [&::-webkit-scrollbar-track]:bg-gray-100
                   [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-gray-300"
            >
                <section className="w-full h-full flex flex-col justify-center items-center gap-4">
                    <h1 className="text-xl font-bold text-gray-800">Barcode Scanner</h1>
                    <div
                        id="scanner-container"
                        className="w-full max-w-screen-sm h-[calc(100vh-200px)] border border-gray-300 rounded-lg shadow-md bg-white flex justify-center items-center flex-col"
                    >
                        <p className="text-gray-500">Initializing camera...</p>
                    </div>
                    {scannedCode ? (
                        <p className="text-lg text-red-600 font-semibold">
                            <strong>Scanned Code:</strong> {scannedCode}
                        </p>
                    ) : (
                        <p className="text-gray-600">Point your camera at a barcode to scan.</p>
                    )}
                </section>
            </main>
        </div>
    );
};

export default QuaggaScanner;
