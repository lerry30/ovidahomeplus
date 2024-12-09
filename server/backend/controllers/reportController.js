import { requestHandler } from '../utils/requestHandler.js';
import { isValidDate, formattedDate } from '../utils/datetime.js';
import * as expenseStmt from '../mysql/expense.js';
import * as soldItemStmt from '../mysql/soldItems.js';


/*
   desc     Get report by date
   route    POST /api/reports/date
   access   private
*/
const getReportByDate = requestHandler(async (req, res, database) => {
    const date = String(req.body?.date).trim();

    if(!isValidDate(date)) throw {status: 400, message: 'Date is invalid.'};

    const nDate = formattedDate(date);
    const [expensesResult] = await database.execute(expenseStmt.getExpensesByDate, [nDate]);
    const [soldItemsResults] = await database.execute(soldItemStmt.getSoldItemsByDate, [nDate]);

    const results = {expenses: expensesResult, soldItems: soldItemsResults};
    res.status(200).json({results});
});

export {
    getReportByDate,
};