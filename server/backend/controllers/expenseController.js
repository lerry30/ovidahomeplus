import { requestHandler } from '../utils/requestHandler.js';
import { toNumber } from '../utils/number.js';
import * as expenseStmt from '../mysql/expense.js';

/*
   desc     Create new expense
   route    POST /api/expenses/new
   access   private
*/
const newExpense = requestHandler(async (req, res, database) => {
    const expenseType = String(req.body?.expenseType).trim();
    const expenseAmount = toNumber(req.body?.expenseAmount) ?? 0;

    if(!expenseType) throw {status: 400, message: 'Please include the expense type.'};
    if(expenseAmount <= 0) throw {status: 400, message: 'Please specify the amount of the expense.'}

    const [result] = await database.execute(expenseStmt.newExpense, [expenseType, expenseAmount]);
    if(result?.insertId > 0) {
        res.status(200).json({
            expenseType,
            expenseAmount,
        });
    }
});

export {
    newExpense,
};