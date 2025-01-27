import { requestHandler } from '../utils/requestHandler.js';
import { toNumber } from '../utils/number.js';
import { setBarcodeSequence } from '../helper/barcode.js';
import { generateBarcode } from '../utils/generateBarcode.js';
import { parseOneDeep } from '../utils/jsonParse.js';
import * as barcodeStmt from '../mysql/barcode.js';
import * as batchStmt from '../mysql/batch.js';

/*
   desc     Create new barcode
   route    POST /api/barcodes/new
   access   private
*/
const newBarcode = requestHandler(async (req, res, database) => {
    const itemId = toNumber(req.body?.itemId);
    const batchId = toNumber(req.body?.batchId);
    let quantity = toNumber(req.body?.quantity);

    if(itemId <= 0) throw {status: 400, message: 'No item selected.'};
    if(batchId <= 0) throw {status: 400, message: 'No batch number provided.'};
    if(quantity <= 0) throw {status: 400, message: 'Quantity must be greater than zero.'};

    // create barcode
    // get items to verify barcode uniqueness
    const [itemData] = await database.execute(batchStmt.getAssociatedToBatch, [batchId]);
    // console.log(JSON.stringify(itemData, null, 4));
    // console.log(JSON.stringify({no: itemData?.length, one: itemData[0], two: itemData[1]}, null, 4));
    const barcodes = itemData?.length > 0 ? 
        parseOneDeep(itemData, ['barcodes'])
            ?.map(item => item.barcodes.map(barcode => barcode?.barcode))
            ?.flat(1)
        : [];

    // make it multi insert
    let nForMultiInsertStmt = barcodeStmt.newBarcode;
    const dataToInsert = []
    const barcodePromiseAll = [];
    while(quantity > 0) {
        nForMultiInsertStmt = nForMultiInsertStmt + '(?, ?, ?),';

        const itemBarcode = setBarcodeSequence(itemId, batchId, barcodes);
        const barcodePromise = generateBarcode(itemBarcode);
        barcodePromiseAll.push(barcodePromise);
        barcodes.push(itemBarcode);

        dataToInsert.push(itemId);
        dataToInsert.push(batchId);
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
            batchId,
            quantity
        });
    }
}, 'Barcode: newBarcode');

const deleteBarcode = requestHandler(async (req, res, database) => {
    const id = toNumber(req.body?.id);
    if(!id) throw {status: 400, message: 'Undefined item.'};
    
    const [result] = await database.execute(barcodeStmt.deleteBarcode, [id]);
    if(result?.affectedRows) {
        res.status(200).json({message: 'Successfully Deleted.'});
    }
}, 'Barcode: deleteBarcode');

export {
    newBarcode,
    deleteBarcode,
};
