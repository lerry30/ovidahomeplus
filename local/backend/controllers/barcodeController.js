import { toNumber } from '../utils/number.js';
import { printBarcodeWithText } from '../utils/printer.js';

/*
   desc     Print barcode
   route    POST /local/api/barcodes/print
   access   public
*/
const printBarcode = async (req, res) => {
    try {
        const barcodeData = String(req.body?.barcodeData).trim();
        const text = String(req.body?.text).trim().toUpperCase();

        if(!barcodeData) throw {status: 400, message: 'Barcode is not defined.'}
        if(!text) throw {status: 400, message: 'Barcode description is not defined.'}

        const listOfText = text?.split('-') ?? [];
        const nListOfText = [];
        const offset = 50;
        for(const nText of listOfText) {
            for(let i = 0; i < nText.length; i+=offset) {
                const subText = nText.substring(i, (i+1)*offset);
                nListOfText.push(subText);
            }
        }

        await printBarcodeWithText(
            barcodeData,
            nListOfText,
            {
                x: 100,
                y: 40,
                height: 220,
                width: 5,
                textFontHeight: 12,
                textFontWidth: 8
            }
        );
            
        res.status(200).json({message: 'Print successful'});
    } catch(error) {
        console.log(error);
        res.status(400).json({message: 'There\'s something wrong.'});
    }
}

export {
    printBarcode,
}
