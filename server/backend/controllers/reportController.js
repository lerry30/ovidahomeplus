import { requestHandler } from '../utils/requestHandler.js';
import { isValidDate, formattedDate, daysOfMonths, getMonth } from '../utils/datetime.js';
import { toNumber } from '../utils/number.js';
import { getDir } from '../utils/fileDir.js';
import { htmlWithTailwindTemplate } from '../helper/report.js';
import { writeFile, readdir, unlink } from 'fs/promises';
import * as expenseStmt from '../mysql/expense.js';
import * as soldItemStmt from '../mysql/soldItems.js';
import * as cashDrawerStmt from '../mysql/cashDrawer.js';
import * as denominationStmt from '../mysql/denomination.js';

import puppeteer from 'puppeteer';

/*
   desc     Get report by date
   route    POST /api/reports/date
   access   private
*/
const getReportByDate = requestHandler(async (req, res, database) => {
    const date = String(req.body?.date).trim();

    if (!isValidDate(date)) throw { status: 400, message: 'Date is invalid.' };

    const nDate = formattedDate(date);
    const [expensesResults] = await database.execute(expenseStmt.getExpensesByDate, [nDate]);
    const [soldItemsResults] = await database.execute(soldItemStmt.getSoldItemsByDate, [nDate]);

    const [cashDrawerResults] = await database.execute(cashDrawerStmt.getCashDrawerByDate, [nDate]);
    let currentCashCont = {};
    if(cashDrawerResults?.length > 0) {
        const todaysCashDenom = cashDrawerResults[0];
        const denomId = todaysCashDenom.cashDenominationId;
        const [cashDrawerDenom] = await database.execute(denominationStmt.denomination, [denomId]);
        if(cashDrawerDenom?.length > 0) {
            currentCashCont = cashDrawerDenom[0];
        }
    }

    // I just move the computation here in backend
    let totalExp = 0;
    for (const expense of expensesResults)
        totalExp = totalExp + expense?.amount;

    let gross = 0;
    let totalCash = 0;
    let totalNonCash = 0;
    for (const soldItem of soldItemsResults) {
        const amount = soldItem?.isDiscounted ? soldItem?.maxDiscount : soldItem?.srp;
        gross = gross + amount;
        if(soldItem?.paymentMethod === 'Cash Payment') {
            totalCash = totalCash + amount;
        } else {
            totalNonCash = totalNonCash + amount;
        }
    }

    totalCash = totalCash - totalExp;

    const wordToNumberDenomination = {onethousand: 1000, fivehundred: 500, twohundred: 200, onehundred: 100, fifty: 50, twenty: 20, ten: 10, five: 5, one: 1};

    let totalOfDenominations = 0;
    for(const key in currentCashCont) {
        const nKey = String(key).toLowerCase();
        const value = currentCashCont[key];
        if(!wordToNumberDenomination[nKey]) continue;
        totalOfDenominations = totalOfDenominations + wordToNumberDenomination[nKey] * value;
    }

    const discrepancy = totalOfDenominations - totalCash;

    const results = {
        expenses: expensesResults, 
        soldItems: soldItemsResults, 
        cashDenominations: currentCashCont,
        
        grossSales: gross,
        totalExpenses: totalExp,
        cashPayments: totalCash,
        nonCashPayments: totalNonCash,
        cashDenominationsTotal: totalOfDenominations,
        discrepancy: discrepancy,
    };

    //console.log(results);
    res.status(200).json({ results });
}, 'Report: getReportByDate');

/*
   desc     Get report by month
   route    POST /api/reports/monthly
   access   private
*/
const getReportByMonth = requestHandler(async (req, res, database) => {
    const year = toNumber(req.body?.year);
    const month = toNumber(req.body?.month) + 1;

    if (!month || month > 12) throw { status: 400, message: 'Month is invalid.' };

    const today = new Date();
    const numberOfDaysInMonths = daysOfMonths(year);
    const numberOfDays = numberOfDaysInMonths[month - 1];

    const startDate = `${year}-${month}-1`;
    const endDate = `${year}-${month}-${numberOfDays}`;

    const [soldItemsResults] = await database.execute(soldItemStmt.getSoldItemsBetweenDates, [startDate, endDate]);
    const [expensesResults] = await database.execute(expenseStmt.getExpensesBetweenDates, [startDate, endDate]);
    const [cashDrawerResults] = await database.execute(cashDrawerStmt.getCashDrawerBetweenDates, [startDate, endDate]);

    const wordToNumberDenomination = {onethousand: 1000, fivehundred: 500, twohundred: 200, onehundred: 100, fifty: 50, twenty: 20, ten: 10, five: 5, one: 1};
    let allDenominations = [];

    if(cashDrawerResults?.length > 0) {
        const createPlaceHolder = cashDrawerResults?.map(() => '?').join(', ');
        const cashDrawerIds = cashDrawerResults?.map(item => item.cashDenominationId);

        const [denominationResults] = await database.execute(
            `${denominationStmt.denominations}(${createPlaceHolder});`, cashDrawerIds);

        if(denominationResults?.length > 0)
            allDenominations = denominationResults;
    }

    const items = [];
    for(let i = 0; i < numberOfDays; i++) {
        const nItem = {
            date: `${year}-${month}-${i + 1}`,
            grossSales: 0,
            totalExpenses: 0,
            //totalPayments: 0,
            cashPayments: 0,
            nonCashPayments: 0,
            cashDenominationsTotal: 0,
            discrepancy: 0,
        };

        for(const soldItem of soldItemsResults) {
            if(formattedDate(soldItem?.soldAt) === nItem.date) {
                const amount = soldItem?.isDiscounted ? toNumber(soldItem?.maxDiscount) : toNumber(soldItem?.srp);
                nItem.grossSales = nItem.grossSales + amount;
                //nItem.totalPayments = nItem.totalPayments + amount;

                if(soldItem?.paymentMethod === 'Cash Payment') {
                    nItem.cashPayments = nItem.cashPayments + amount;
                } else {
                    nItem.nonCashPayments = nItem.nonCashPayments + amount;
                }
            }
        }

        for(const expense of expensesResults) {
            if(formattedDate(expense?.createdAt) === nItem.date) {
                const amount = toNumber(expense?.amount);
                nItem.totalExpenses = nItem.totalExpenses + amount;
                //nItem.totalPayments = nItem.totalPayments - amount;
                nItem.cashPayments = nItem.cashPayments - amount;
            }
        }

        for(const denom of allDenominations) {
            if(formattedDate(denom?.createdAt) === nItem.date) {
                let total = 0;
                for(const key in denom) {
                    const nKey = String(key).toLowerCase();
                    if(!wordToNumberDenomination[nKey]) continue;
                    total = total + wordToNumberDenomination[nKey] * denom[key];
                }
                nItem.cashDenominationsTotal = total;
                break;
            }
        }

        nItem.discrepancy = nItem.cashDenominationsTotal - nItem.cashPayments;
        items.push(nItem);
    }

    res.status(200).json({ results: items });
}, 'Report: getReportByMonth');

/*
   desc     Get report by months in a year
   route    POST /api/reports/yearly
   access   private
*/
const getReportByYear = requestHandler(async (req, res, database) => {
    const year = toNumber(req.body?.year);

    if (!year) throw { status: 400, message: 'Year is invalid.' };
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const startDate = `${year}-1-1`;
    const endDate = `${year}-12-31`;

    const [soldItemsResults] = await database.execute(soldItemStmt.getSoldItemsBetweenDates, [startDate, endDate]);
    const [expensesResults] = await database.execute(expenseStmt.getExpensesBetweenDates, [startDate, endDate]);
    const [cashDrawerResults] = await database.execute(cashDrawerStmt.getCashDrawerBetweenDates, [startDate, endDate]);

    const wordToNumberDenomination = {onethousand: 1000, fivehundred: 500, twohundred: 200, onehundred: 100, fifty: 50, twenty: 20, ten: 10, five: 5, one: 1};
    let allDenominations = [];

    if(cashDrawerResults?.length > 0) {
        const createPlaceHolder = cashDrawerResults?.map(() => '?').join(', ');
        const cashDrawerIds = cashDrawerResults?.map(item => item.cashDenominationId);

        const [denominationResults] = await database.execute(
            `${denominationStmt.denominations}(${createPlaceHolder});`, cashDrawerIds);

        if(denominationResults?.length > 0)
            allDenominations = denominationResults;
    }

    const items = [];
    for (let i = 0; i < months.length; i++) {
        const month = months[i];
        const nItem = {
            month,
            grossSales: 0,
            totalExpenses: 0,
            //totalPayments: 0,
            cashPayments: 0,
            nonCashPayments: 0,
            cashDenominationsTotal: 0,
            discrepancy: 0,
        };

        for (const soldItem of soldItemsResults) {
            const soldItemMonth = toNumber(getMonth(soldItem?.soldAt));
            if (soldItemMonth === i + 1) {
                const amount = soldItem?.isDiscounted ? toNumber(soldItem?.maxDiscount) : toNumber(soldItem?.srp);
                nItem.grossSales = nItem.grossSales + amount;
                //nItem.totalPayments = nItem.totalPayments + amount;

                if(soldItem?.paymentMethod === 'Cash Payment') {
                    nItem.cashPayments = nItem.cashPayments + amount;
                } else {
                    nItem.nonCashPayments = nItem.nonCashPayments + amount;
                }
            }
        }

        for (const expense of expensesResults) {
            const expenseMonth = toNumber(getMonth(expense?.createdAt));
            if (expenseMonth === i + 1) {
                const amount = toNumber(expense?.amount);
                nItem.totalExpenses = nItem.totalExpenses + amount;
                //nItem.totalPayments = nItem.totalPayments - amount;
                nItem.cashPayments = nItem.cashPayments - amount;
            }
        }

        for(const denom of allDenominations) {
            const denomMonth = toNumber(getMonth(denom?.createdAt));
            if(denomMonth === i + 1) {
                let total = 0;
                for(const key in denom) {
                    const nKey = String(key).toLowerCase();
                    if(!wordToNumberDenomination[nKey]) continue;
                    total = total + wordToNumberDenomination[nKey] * denom[key];
                }
                nItem.cashDenominationsTotal = total;
                break;
            }
        }

        nItem.discrepancy = nItem.cashDenominationsTotal - nItem.cashPayments;
        items.push(nItem);
    }

    res.status(200).json({ results: items });
}, 'Report: getReportByYear');


/*
   desc     Generate pdf to print
   route    POST /api/reports/print
   access   private
*/
const generatePDF = requestHandler(async (req, res, database) => {
    const html = String(req.body?.html).trim();

    const htmlContent = htmlWithTailwindTemplate(html);
    const rootDir = getDir('uploads/pdfs');
    const fileName = Date.now();
    const outputPath = `${rootDir}/${fileName}.pdf`;

    const files = await readdir(rootDir);
    await Promise.all(files.map(file => unlink(`${rootDir}/${file}`)));

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Disable the sandbox
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdf = await page.pdf({ format: 'Letter' });

    await writeFile(outputPath, pdf);

    await browser.close();

    res.status(200).json({ fileName: `${fileName}.pdf` });
}, 'Report: generatePDF');

export {
    getReportByDate,
    getReportByMonth,
    getReportByYear,
    generatePDF,
};
