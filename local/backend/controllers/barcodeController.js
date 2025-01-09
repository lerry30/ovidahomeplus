import { toNumber } from '../utils/number.js';
import { printBarcodeWithText } from '../utils/printer.js';
import { splitNWrapText, barcodeConfig } from '../helper/barcode.js';

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

        const listOfText = splitNWrapText(text);
        await printBarcodeWithText(barcodeData, listOfText, barcodeConfig);
            
        res.status(200).json({message: 'Print successful'});
    } catch(error) {
        console.log(error);
        res.status(400).json({message: 'There\'s something wrong.'});
    }
}

/*
   desc     Print all barcodes
   route    POST /local/api/barcodes/printall
   access   public
*/
const printAllBarcodes = async (req, res) => {
    try {
        const dataset = req.body?.dataset;

        if(!dataset?.length === 0) throw {status: 400, message: 'Barcode is not defined.'}

        const commands = [];
        for(const barcode of dataset) {
            const barcodeData = barcode?.barcodeData;
            const text = barcode?.text;
            
            if(!barcodeData || !text) continue;

            const listOfText = splitNWrapText(text);
            const printCommand = printBarcodeWithText(barcodeData, listOfText, barcodeConfig);
            commands.push(printCommand);
        }

        Promise.all(commands);
        res.status(200).json({message: 'Print successful'});
    } catch(error) {
        console.log(error);
        res.status(400).json({message: 'There\'s something wrong.'});
    }
}

export {
    printBarcode,
    printAllBarcodes,
}
