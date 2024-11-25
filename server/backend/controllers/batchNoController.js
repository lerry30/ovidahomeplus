// import { requestHandler } from '../utils/requestHandler.js';
// import { toNumber } from '../utils/number.js';
// import * as batchNoStmt from '../mysql/batchNo.js';

// /*
//    desc     Check batch number
//    route    POST /api/batchno/check
//    access   private
// */
// const checkBatchNo = requestHandler(async (req, res, database) => {
//     const batchNo = toNumber(req.body?.batchNo);

//     if(batchNo < 1) throw new Error('Batch number is invalid.');

//     const [result] = await database.execute(batchNoStmt, [batchNo]);
// });

// export {
//     checkBatchNo,
// };