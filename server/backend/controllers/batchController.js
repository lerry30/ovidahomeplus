import { requestHandler } from '../utils/requestHandler.js';
import { toNumber } from '../utils/number.js';
import { isValidDate } from '../utils/datetime.js';
import * as batchStmt from '../mysql/batch.js';

/*
   desc     Create new batch
   route    POST /api/batches/new
   access   private
*/
const newBatch = requestHandler(async (req, res, database) => {
    const batchNo = toNumber(req.body?.batchNo);
    const deliveryRecieptNo = String(req.body?.deliveryRecieptNo).trim().replace(/[^0-9]+/g, '');
    let deliveryDate = String(req.body?.deliveryDate)?.trim();

    if(batchNo < 1) throw new Error('Batch number is invalid.');
    if(deliveryDate) {
        if(!isValidDate(deliveryDate)) {
            throw {status: 400, message: 'Invalid Date'}
        }
    } else {
        deliveryDate = null;
    }

    const [selectBatch] = await database.execute(batchStmt.batch, [batchNo]);
    if(selectBatch && selectBatch?.length > 0) throw {status: 400, message: `Batch ${batchNo} already exists.`}

    const [batch] = await database.execute(batchStmt.newBatch, [batchNo, deliveryRecieptNo, deliveryDate]);
    if(batch?.insertId > 0) {
        res.status(200).json({batchNo, deliveryRecieptNo, deliveryDate});
    }
});

/*
   desc     Get batches
   route    GET /api/batches/get
   access   public
*/
const getBatches = requestHandler(async (req, res, database) => {
    const [results] = await database.execute(batchStmt.batches, []);
    res.status(200).json({results});
});

/*
   desc     Get specific batch
   route    POST /api/batches/batch
   access   public
*/
const getBatch = requestHandler(async (req, res, database) => {
    const batchNo = toNumber(req.body?.batchNo);
    const [results] = await database.execute(batchStmt.batch, [batchNo]);
    const data = results?.length > 0 ? results[0] : {};
    res.status(200).json({results: data});
});

/*
   desc     Get batches
   route    PUT /api/batches/update
   access   private
*/
const updateBatch = requestHandler(async (req, res, database) => {
    const batchNo = toNumber(req.body?.batchNo);
    const deliveryRecieptNo = String(req.body?.deliveryRecieptNo).trim().replace(/[^0-9]+/g, '');
    let deliveryDate = String(req.body?.deliveryDate)?.trim();

    if(batchNo < 1) throw new Error('Batch number is invalid.');
    if(deliveryDate) {
        if(!isValidDate(deliveryDate)) {
            throw {status: 400, message: 'Invalid Date'}
        }
    } else {
        deliveryDate = null;
    }

    const [batch] = await database.execute(batchStmt.updateBatch, [deliveryRecieptNo, deliveryDate, batchNo]);
    if(batch?.affectedRows > 0) {
        res.status(200).json({batchNo, deliveryRecieptNo, deliveryDate});
    }
});

/*
   desc     Get specific batch with data associated with it
   route    POST /api/batches/batch-data
   access   private
*/
const getBatchWithData = requestHandler(async (req, res, database) => {
    const batchNo = toNumber(req.body?.batchNo);
    const [results] = await database.execute(batchStmt.getAssociatedToBatch, [batchNo]);
    res.status(200).json({results});
});

export {
    newBatch,
    getBatches,
    getBatch,
    updateBatch,
    getBatchWithData,
};