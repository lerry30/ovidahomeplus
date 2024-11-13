import { toNumber } from '../utils/number.js';

export const setBarcodeSequence = (productTypeId, items) => {
    // create barcode
    const fCode =  String(productTypeId).padStart(3, '0');
    const lastItemBarcode = items?.length > 0 ? items[0]?.barcode?.substring(3) : ''; // get the last item so new barcode will be increment for uniqueness
    
    let itemBarcode = fCode + String(toNumber(lastItemBarcode)+1).padStart(11, '0');
    let maxIteration = 1000;

    // convert to object
    const barcodes = {};
    for(let i = 0; i < items.length; i++) {
        const barcode = items[i]?.barcode;
        barcodes[barcode] = true;
    }

    while(maxIteration > 0) {
        maxIteration--;
        if(barcodes[itemBarcode]) {
            itemBarcode = fCode + String(toNumber(lastItemBarcode)+1).padStart(11, '0');
        } else {
            break;
        }
    }

    console.log({maxIteration});
    return itemBarcode
}