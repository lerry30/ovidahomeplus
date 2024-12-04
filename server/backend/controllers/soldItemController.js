import { requestHandler } from '../utils/requestHandler.js';
import * as soldItemStmt from '../mysql/soldItems.js';

/*
   desc     Get sold items today
   route    GET /api/solditems/today
   access   public
*/
const getSoldItemsToday = requestHandler(async (req, res, database) => {
    const [results] = await database.query(soldItemStmt.getSoldItemsToday, []);
    res.status(200).json({results});
});

export {
    getSoldItemsToday,
};