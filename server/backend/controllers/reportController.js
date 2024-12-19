import { requestHandler } from '../utils/requestHandler.js';
import { isValidDate, formattedDate, daysOfMonths, getMonth } from '../utils/datetime.js';
import { toNumber } from '../utils/number.js';
import { getDir } from '../utils/fileDir.js';
import { htmlWithTailwindTemplate } from '../helper/report.js';
import { writeFile, readdir, unlink } from 'fs/promises';
import * as expenseStmt from '../mysql/expense.js';
import * as soldItemStmt from '../mysql/soldItems.js';

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

    const results = { expenses: expensesResults, soldItems: soldItemsResults };
    res.status(200).json({ results });
});

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

    const items = [];
    for (let i = 0; i < numberOfDays; i++) {
        const nItem = {
            date: `${year}-${month}-${i + 1}`,
            totalCollection: 0,
            totalExpenses: 0,
            netIncome: 0
        };

        for (const soldItem of soldItemsResults) {
            if (formattedDate(soldItem?.soldAt) === nItem.date) {
                const amount = soldItem?.isDiscounted ? toNumber(soldItem?.maxDiscount) : toNumber(soldItem?.srp);
                nItem.totalCollection = nItem.totalCollection + amount;
                nItem.netIncome = nItem.netIncome + amount;
            }
        }

        for (const expense of expensesResults) {
            if (formattedDate(expense?.createdAt) === nItem.date) {
                const amount = toNumber(expense?.amount);
                nItem.totalExpenses = nItem.totalExpenses + amount;
                nItem.netIncome = nItem.netIncome - amount;
            }
        }

        items.push(nItem);
    }

    res.status(200).json({ results: items });
});

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

    const items = [];
    for (let i = 0; i < months.length; i++) {
        const month = months[i];
        const nItem = {
            month,
            totalCollection: 0,
            totalExpenses: 0,
            netIncome: 0
        };

        for (const soldItem of soldItemsResults) {
            const soldItemMonth = toNumber(getMonth(soldItem?.soldAt));
            if (soldItemMonth === i + 1) {
                const amount = soldItem?.isDiscounted ? toNumber(soldItem?.maxDiscount) : toNumber(soldItem?.srp);
                nItem.totalCollection = nItem.totalCollection + amount;
                nItem.netIncome = nItem.netIncome + amount;
            }
        }

        for (const expense of expensesResults) {
            const expenseMonth = toNumber(getMonth(expense?.createdAt));
            if (expenseMonth === i + 1) {
                const amount = toNumber(expense?.amount);
                nItem.totalExpenses = nItem.totalExpenses + amount;
                nItem.netIncome = nItem.netIncome - amount;
            }
        }

        items.push(nItem);
    }

    res.status(200).json({ results: items });
});


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
    const pdf = await page.pdf({ format: 'A4' });

    await writeFile(outputPath, pdf);

    await browser.close();

    res.status(200).json({ fileName: `${fileName}.pdf` });
});

export {
    getReportByDate,
    getReportByMonth,
    getReportByYear,
    generatePDF,
};
