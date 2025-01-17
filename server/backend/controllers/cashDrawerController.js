import { requestHandler } from '../utils/requestHandler.js';
import { toNumber } from '../utils/number.js';
import { isValidDate, formattedDate } from '../utils/datetime.js';
import * as cashDrawerStmt from '../mysql/cashDrawer.js';
import * as denominationStmt from '../mysql/denomination.js';

/*
   desc     Get the contents of the cash drawer
   route    GET /api/cashdrawer/get
   access   private
*/
const getCashDrawerContents = requestHandler(async (req, res, database) => {
    const [drawer] = await database.query(cashDrawerStmt.cashDrawer, []);
    const todaysDrawerCashDenom = drawer[0] ?? {};
    // get the cash drawer denom in denomination table
    const denomId = todaysDrawerCashDenom?.cashDenominationId;
    if(denomId) {
        const [cashDrawerDenom] = await database.execute(denominationStmt.denomination, [denomId]);
        const currentCashCont = cashDrawerDenom[0] ?? {};

        res.status(200).json({cashDenominations: currentCashCont});
        return;
    }

    //throw {status: 400, message: 'Cash Drawer data not found or no sold items yet.'}
}, 'CashDrawer: getCashDrawerContents');

/*
   desc     Update the cash drawer contents
   route    PUT /api/cashdrawer/update
   access   private
*/
const updateCashDrawer = requestHandler(async (req, res, database) => {
    const data = req.body?.data;

    if(!data.hasOwnProperty('onethousand') ||
        !data.hasOwnProperty('fivehundred') ||
        !data.hasOwnProperty('twohundred') ||
        !data.hasOwnProperty('onehundred') ||
        !data.hasOwnProperty('fifty') ||
        !data.hasOwnProperty('twenty') ||
        !data.hasOwnProperty('ten') ||
        !data.hasOwnProperty('five') ||
        !data.hasOwnProperty('one')) {
        throw new Error('A certain property not exists in your request.');
    }

    const oneThousand = toNumber(data?.onethousand);
    const fiveHundred = toNumber(data?.fivehundred);
    const twoHundred = toNumber(data?.twohundred);
    const oneHundred = toNumber(data?.onehundred);
    const fifty = toNumber(data?.fifty);
    const twenty = toNumber(data?.twenty);
    const ten = toNumber(data?.ten);
    const five = toNumber(data?.five);
    const one = toNumber(data?.one);

    const [drawer] = await database.query(cashDrawerStmt.cashDrawer, []);
    const todaysDrawerCashDenom = drawer[0];
    if(todaysDrawerCashDenom) {
        // get the cash drawer denom in denomination table
        const denomId = todaysDrawerCashDenom?.cashDenominationId;

        //'UPDATE cash_denominations SET one_thousand=?, five_hundred=?, two_hundred=?, one_hundred=?, fifty=?, twenty=?, ten=?, five=?, one=? WHERE id=?;';
        const [result] = await database.execute(denominationStmt.updateDenomination, 
            [oneThousand, fiveHundred, twoHundred, oneHundred, fifty, twenty, ten, five, one, denomId]);
        const isUpdated = result.affectedRows;

        if(isUpdated) {
            res.status(200).json({data});
            return;
        }
    }

    throw new Error('Updating the cash denomination error.');
}, 'CashDrawer: UpdateCashDrawer');

/*
   desc     Get the contents of cash drawer with the specific amount
   route    POST /api/cashdrawer/date
   access   private
*/
const getCashDrawerByDate = requestHandler(async (req, res, database) => {
    const date = String(req.body.date).trim();

    if(!isValidDate(date)) throw {status: 400, message: 'Invalid date.'};

    const nDate = formattedDate(date);
    const [results] = await database.execute(cashDrawerStmt.getCashDrawerByDate, [nDate]);
    const todaysCashDenom = results[0];
    if(todaysCashDenom) {
        const denomId = todaysCashDenom.cashDenominationId;
        const [cashDrawerDenom] = await database.execute(denominationStmt.denomination, [denomId]);
        const currentCashCont = cashDrawerDenom[0] ?? {};

        if(currentCashCont) {
            res.status(200).json({results: currentCashCont});
            return;
        }
    }
    throw new Error('Getting cash denominations by date error.');
}, 'CashDrawer: getCashDrawerByDate');

export {
    getCashDrawerContents,
    updateCashDrawer,
    getCashDrawerByDate,
};
