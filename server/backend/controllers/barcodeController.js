import { requestHandler } from '../utils/requestHandler.js';
import { toNumber } from '../utils/number.js';
import { setBarcodeSequence } from '../helper/barcode.js';
import { generateBarcode } from '../utils/generateBarcode.js';
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
    const [batchData] = await database.execute(batchStmt.getAssociatedToBatch, [batchNo]);
    // console.log(JSON.stringify(batchData, null, 4));
    const barcodes = batchData?.length > 0 ? batchData[0] : [];
    
    // make it multi insert
    let nForMultiInsertStmt = barcodeStmt.newBarcode;
    const dataToInsert = []
    while(quantity > 0) {
        nForMultiInsertStmt = nForMultiInsertStmt + '(?, ?, ?),';

        const itemBarcode = setBarcodeSequence(itemId, batchNo, barcodes);
        generateBarcode(itemBarcode);
        barcodes.push(itemBarcode);

        dataToInsert.push(itemId);
        dataToInsert.push(batchNo);
        dataToInsert.push(itemBarcode);

        quantity--;
    }

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

export {
    newBarcode,
};