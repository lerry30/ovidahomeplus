import { requestHandler } from '../utils/requestHandler.js';
import { toNumber } from '../utils/number.js';
import { isValidDate, formattedDate } from '../utils/datetime.js';
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

/*
   desc     Get expenses
   route    GET /api/expenses/get
   access   public
*/
const getExpensesToday = requestHandler(async (req, res, database) => {
    const [results] = await database.query(expenseStmt.getExpensesToday, []);
    res.status(200).json({results});
});

/*
   desc     Update expense
   route    PUT /api/expenses/update
   access   private
*/
const updateExpense = requestHandler(async (req, res, database) => {
    const id = toNumber(req.body?.id) ?? 0;
    const expenseType = String(req.body?.expenseType).trim();
    const expenseAmount = toNumber(req.body?.expenseAmount) ?? 0;

    if(!id) throw {status: 400, message: 'The expense type is undefined.'};
    if(!expenseType) throw {status: 400, message: 'Please include the expense type.'};
    if(expenseAmount <= 0) throw {status: 400, message: 'Please specify the amount of the expense.'}

    const [result] = await database.execute(expenseStmt.updateExpense, [expenseType, expenseAmount, id]);
    if(result?.affectedRows > 0) {
        res.status(200).json({
            expenseType,
            expenseAmount,
        });
    }
});

/*
   desc     Delete expense
   route    DELETE /api/expenses/delete
   access   private
*/
const deleteExpense = requestHandler(async (req, res, database) => {
    const id = toNumber(req.body?.id) ?? 0;
    if(!id) throw {status: 400, message: 'The expense type is undefined.'};

    const [result] = await database.execute(expenseStmt.deleteExpense, [id]);
    if(result?.affectedRows > 0) {
        res.status(200).json({id});
    }
});

/*
   desc     Get expenses by date
   route    POST /api/expenses/date
   access   private
*/
const getExpensesByDate = requestHandler(async (req, res, database) => {
    const date = String(req.body?.date).trim();

    if(!isValidDate(date)) throw {status: 400, message: 'Invalid date.'};

    const nDate = formattedDate(date);
    const [results] = await database.execute(expenseStmt.getExpensesByDate, [nDate]);
    res.status(200).json({results});
});


export {
    newExpense,
    getExpensesToday,
    updateExpense,
    deleteExpense,
    getExpensesByDate,
};