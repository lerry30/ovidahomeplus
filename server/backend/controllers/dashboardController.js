import { requestHandler } from '../utils/requestHandler.js';
import { getMonth } from '../utils/datetime.js';
import { toNumber } from '../utils/number.js';

import * as soldItemStmt from '../mysql/soldItems.js';
import * as barcodeStmt from '../mysql/barcode.js';
import * as supplierStmt from '../mysql/supplier.js';
import * as productTypeStmt from '../mysql/productType.js';
import * as customerStmt from '../mysql/customer.js';

/*
   desc     Get dashboard data for statistics
   route    GET /api/dashboard/get
   access   public
*/
const getData = requestHandler(async (req, res, database) => {
    const [soldItemsToday] = await database.query(soldItemStmt.getSoldItemsToday, []);
    const [soldItems] = await database.query(soldItemStmt.soldItems, []);
    const [barcodes] = await database.query(barcodeStmt.barcodes, []);
    const [suppliers] = await database.query(supplierStmt.suppliers, []);
    const [productTypes] = await database.query(productTypeStmt.productTypes, []);

    const year = new Date()?.getFullYear();
    const startDate = `${year}-1-1`;
    const endDate = `${year}-12-31`;

    const [soldItemsThisYear] = await database.execute(soldItemStmt.getSoldItemsBetweenDates, [startDate, endDate]);
    const [customers] = await database.query(customerStmt.uniqueCustomersQuery, []);

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthlySalesThisYear = [];
    const noOfCustomersThisYear = [];
    for (let i = 0; i < months.length; i++) {
        const month = months[i];
        const saleData = {
            month,
            totalCollection: 0,
            netIncome: 0
        };
        let noOfCustomer = 0;
        for (const soldItem of soldItemsThisYear) {
            const soldItemMonth = toNumber(getMonth(soldItem?.soldAt));
            if (soldItemMonth === i + 1) {
                const amount = soldItem?.isDiscounted ? toNumber(soldItem?.maxDiscount) : toNumber(soldItem?.srp);
                saleData.totalCollection = saleData.totalCollection + amount;
                saleData.netIncome = saleData.netIncome + amount;
            }
        }
        for (const customer of customers) {
            const customerCreatedMonth = toNumber(getMonth(customer?.createdAt));
            if (customerCreatedMonth === i + 1) noOfCustomer++;
        }
        monthlySalesThisYear.push(saleData);
        noOfCustomersThisYear.push(noOfCustomer);
    }

    const [rankedSoldItems] = await database.query(soldItemStmt.rankedSoldItems, []);

    res.status(200).json({
        soldItemsToday, 
        soldItems, 
        barcodes, 
        suppliers,
        productTypes,
        monthlySalesThisYear,
        noOfCustomersThisYear,
        rankedSoldItems,
    });
}, 'Dashboard: getData');

export {
    getData,
};
