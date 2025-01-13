import { toNumber } from '../utils/number.js';

export const setBarcodeSequence = (itemId, batchNo, batchDate, barcodesDetails) => {
    const fCode =  String(itemId).padStart(3, '0');
    const sCode = String(batchNo).padStart(2, '0');
    const tCode = String(batchDate).split('-').join('');

    // const lastItemBarcode = items?.length > 0 ? items[0]?.barcode?.substring(3) : ''; // get the last item so new barcode will be increment for uniqueness
    // let itemBarcode = fCode + String(toNumber(lastItemBarcode)+1).padStart(11, '0');

    // get the max number
    let largeItemNo = 0;
    for(let i = 0; i < barcodesDetails.length; i++) {
        const barcodeNo = toNumber(barcodesDetails[i].substring(13));
        largeItemNo = Math.max(largeItemNo, barcodeNo);
    }

    const fthCode = String(largeItemNo+1).padStart(3, '0')

    return `${fCode}${sCode}${tCode}${fthCode}`;
}
