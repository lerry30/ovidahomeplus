import { requestHandler } from '../utils/requestHandler.js';
import { toNumber } from '../utils/number.js';
import { setBarcodeSequence } from '../helper/barcode.js';
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
    const quantity = toNumber(req.body?.quantity);

    if(itemId <= 0) throw {status: 400, message: 'No item selected.'};
    if(batchNo <= 0) throw {status: 400, message: 'No batch number provided.'};
    if(quantity <= 0) throw {status: 400, message: 'Quantity must be greater than zero.'};

    // create barcode
    // get items to verify barcode uniqueness
    const [getItems] = await database.execute(batchStmt.getAssociatedToBatch, [batchNo]);
    console.log(JSON.stringify(getItems, null, 4));
    // const itemBarcode = setBarcodeSequence(itemId, batchNo, getItems);
});

export {
    newBarcode,
};