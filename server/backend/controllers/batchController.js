import { requestHandler } from '../utils/requestHandler.js';
import { toNumber } from '../utils/number.js';
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


export {
    newBatch,
    getBatches,
};