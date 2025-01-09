import { requestHandler } from '../utils/requestHandler.js';
import { toNumber } from '../utils/number.js';
import { setBarcodeSequence } from '../helper/barcode.js';
import { generateBarcode } from '../utils/generateBarcode.js';
import { parseOneDeep } from '../utils/jsonParse.js';
import { printBarcodeWithText } from '../utils/printer.js';
import * as barcodeStmt from '../mysql/barcode.js';
import * as batchStmt from '../mysql/batch.js';

/*
   desc     Create new barcode
   route    POST /api/barcodes/new
   access   private
*/
const newBarcode = requestHandler(async (req, res, database) => {
    const itemId = toNumber(req.body?.itemId);
    const batchNo = toNumber(req.body?.batchNo);
    let quantity = toNumber(req.body?.quantity);

    if(itemId <= 0) throw {status: 400, message: 'No item selected.'};
    if(batchNo <= 0) throw {status: 400, message: 'No batch number provided.'};
    if(quantity <= 0) throw {status: 400, message: 'Quantity must be greater than zero.'};

    // create barcode
    // get items to verify barcode uniqueness
    const [itemData] = await database.execute(batchStmt.getAssociatedToBatch, [batchNo]);
    // console.log(JSON.stringify(itemData, null, 4));
    // console.log(JSON.stringify({no: itemData?.length, one: itemData[0], two: itemData[1]}, null, 4));
    const barcodes = itemData?.length > 0 ? 
        parseOneDeep(itemData, ['barcodes'])?.map(item => item.barcodes.map(barcode => barcode?.barcode))?.flat(1) 
        : [];

    // make it multi insert
    let nForMultiInsertStmt = barcodeStmt.newBarcode;
    const dataToInsert = []
    const barcodePromiseAll = [];
    while(quantity > 0) {
        nForMultiInsertStmt = nForMultiInsertStmt + '(?, ?, ?),';

        const itemBarcode = setBarcodeSequence(itemId, batchNo, barcodes);
        const barcodePromise = generateBarcode(itemBarcode);
        barcodePromiseAll.push(barcodePromise);
        barcodes.push(itemBarcode);

        dataToInsert.push(itemId);
        dataToInsert.push(batchNo);
        dataToInsert.push(itemBarcode);

        quantity--;
    }

    Promise.all(barcodePromiseAll);

    nForMultiInsertStmt = nForMultiInsertStmt?.substring(0, nForMultiInsertStmt.length-1) + ';';
    // console.log(nForMultiInsertStmt);
    const [result] = await database.execute(nForMultiInsertStmt, dataToInsert);
    if(result?.insertId > 0) {
        res.status(200).json({
            itemId,
            batchNo,
            quantity
        });
    }
});

/*
   desc     Print barcode
   route    POST /api/barcodes/print
   access   private
*/
const printBarcode = requestHandler(async (req, res, database) => {
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
        
    res.status(200).json({ message: 'Print successful' });
});

export {
    newBarcode,
    printBarcode,
};
