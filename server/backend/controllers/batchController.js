import { requestHandler } from '../utils/requestHandler.js';
import { toNumber } from '../utils/number.js';
import { isValidDate, formattedDate } from '../utils/datetime.js';
import { parseOneDeep } from '../utils/jsonParse.js';
import * as batchStmt from '../mysql/batch.js';

/*
   desc     Create new batch
   route    POST /api/batches/new
   access   private
*/
const newBatch = requestHandler(async (req, res, database) => {
    const supplierId = toNumber(req.body?.supplierId);
    const batchNo = toNumber(req.body?.batchNo);
    const deliveryReceiptNo = String(req.body?.deliveryReceiptNo).trim().replace(/[^0-9]+/g, '');
    let deliveryDate = String(req.body?.deliveryDate)?.trim();

    if(supplierId < 1) throw new Error('Supplier is required.');
    if(batchNo < 1) throw new Error('Batch number is invalid.');
    if(!deliveryDate) throw {status: 400, message: 'Date is required.'};
    if(!isValidDate(deliveryDate)) throw {status: 400, message: 'Invalid Date,'};

    const nDeliveryDate = formattedDate(deliveryDate);
    const [selectBatch] = await database.execute(batchStmt.getBatch, [supplierId, batchNo, nDeliveryDate, deliveryReceiptNo]);
    if(selectBatch && selectBatch?.length > 0) throw {status: 400, message: `Batch ${batchNo} already exists.`}

    const [batch] = await database.execute(batchStmt.newBatch, [supplierId, batchNo, deliveryReceiptNo, nDeliveryDate]);
    const batchId = batch?.insertId;
    if(batchId > 0) {
        res.status(200).json({batchId, supplierId, batchNo, deliveryReceiptNo, deliveryDate: nDeliveryDate});
    }
}, 'Batch: newBatch');

/*
   desc     Get batches
   route    GET /api/batches/get
   access   public
*/
const getBatches = requestHandler(async (req, res, database) => {
    const [results] = await database.execute(batchStmt.batches, []);
    res.status(200).json({results});
}, 'Batch: getBatches');

/*
   desc     Get specific batch
   route    POST /api/batches/batch
   access   public
*/
const getBatch = requestHandler(async (req, res, database) => {
    const batchId = toNumber(req.body?.batchId);
    const [results] = await database.execute(batchStmt.batch, [batchId]);
    const data = results?.length > 0 ? results[0] : {};
    res.status(200).json({results: data});
}, 'Batch: getBatch');

/*
   desc     Get batches
   route    PUT /api/batches/update
   access   private
*/
const updateBatch = requestHandler(async (req, res, database) => {
    const batchId = toNumber(req.body?.batchId);
    const supplierId = toNumber(req.body?.supplierId);
    const batchNo = toNumber(req.body?.batchNo);
    const deliveryReceiptNo = String(req.body?.deliveryReceiptNo).trim().replace(/[^0-9]+/g, '');
    let deliveryDate = String(req.body?.deliveryDate)?.trim();

    if(batchId < 1) throw new Error('Undefined batch.');
    if(supplierId < 1) throw new Error('Supplier is required.');
    if(batchNo < 1) throw new Error('Batch number is invalid.');
    if(!deliveryDate) throw {status: 400, message: 'Date is required.'};
    if(!isValidDate(deliveryDate)) throw {status: 400, message: 'Invalid Date,'};

    const nDeliveryDate = formattedDate(deliveryDate);

    const [selectBatch] = await database.execute(batchStmt.getBatch, [supplierId, batchNo, nDeliveryDate, deliveryReceiptNo]);
    if(selectBatch && selectBatch?.length > 0) throw {status: 400, message: `Batch already exists.`}

    const [batch] = await database.execute(batchStmt.updateBatch, [supplierId, batchNo, deliveryReceiptNo, nDeliveryDate, batchId]);
    if(batch?.affectedRows > 0) {
        res.status(200).json({batchId, supplierId, batchNo, deliveryReceiptNo, deliveryDate: nDeliveryDate});
    }
}, 'Batch: updateBatch');

/*
   desc     Get specific batch with data associated with it
   route    POST /api/batches/batch-data
   access   private
*/
const getBatchWithData = requestHandler(async (req, res, database) => {
    const batchId = toNumber(req.body?.batchId);
    const [results] = await database.execute(batchStmt.getAssociatedToBatch, [batchId]);
    const items = results?.length > 0 ? parseOneDeep(results, ['barcodes']) : [];
    res.status(200).json({results: items});
}, 'Batch getBatchWithData');

/*
   desc     Get batches by supplier
   route    POST /api/batches/supplier-based
   access   private
*/
const getBatchesBySupplier = requestHandler(async (req, res, database) => {
    const supplierId = toNumber(req.body?.supplierId);
    const [results] = await database.execute(batchStmt.getBatchesBySupplier, [supplierId]);
    res.status(200).json({results});
}, 'Batch: getBatchesBySupplier');

export {
    newBatch,
    getBatches,
    getBatch,
    updateBatch,
    getBatchWithData,
    getBatchesBySupplier,
};
