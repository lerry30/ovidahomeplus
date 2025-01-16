import { requestHandler } from '../utils/requestHandler.js';
import { isValidDate, formattedDate } from '../utils/datetime.js';
import * as soldItemStmt from '../mysql/soldItems.js';

/*
   desc     Get sold items today
   route    GET /api/solditems/today
   access   public
*/
const getSoldItemsToday = requestHandler(async (req, res, database) => {
    const [results] = await database.query(soldItemStmt.getSoldItemsToday, []);
    res.status(200).json({results});
}, 'SoldItem: getSoldItemsToday');

/*
   desc     Get sold items by date
   route    POST /api/solditems/date
   access   private
*/
const getSoldItemsByDate = requestHandler(async (req, res, database) => {
    const date = String(req.body?.date).trim();

    if(!isValidDate(date)) throw {status: 400, message: 'Invalid date.'};

    const nDate = formattedDate(date);
    const [results] = await database.execute(soldItemStmt.getSoldItemsByDate, [nDate]);
    res.status(200).json({results});
}, 'SoldItem: getSoldItemsByDate');

export {
    getSoldItemsToday,
    getSoldItemsByDate,
};
