import { requestHandler } from '../utils/requestHandler.js';
import { toNumber } from '../utils/number.js';
import * as orderStmt from '../mysql/order.js';
import * as customerStmt from '../mysql/customer.js';
import * as itemStmt from '../mysql/item.js';
import * as denominationStmt from '../mysql/denomination.js';
import * as paymentStmt from '../mysql/payment.js';
import * as cashDrawerStmt from '../mysql/cashDrawer.js';

/*
   desc     Create new customer order
   route    POST /api/orders/new
   access   private
*/
const newOrder = requestHandler(async (req, res, database) => {
    const firstname = String(req.body?.customerInfo?.firstname).trim();
    const lastname = String(req.body?.customerInfo?.lastname).trim();
    const address = String(req.body?.customerInfo?.address).trim();
    const fContact = String(req.body?.customerInfo?.contacts?.first).trim();
    const sContact = String(req.body?.customerInfo?.contacts?.second).trim() ?? '';

    const orders = req.body?.orders;
    const payment = req.body?.payment;
    const paymentMethod = String(payment?.paymentMethod).trim();

    if(!firstname || !lastname || !address || !fContact) throw {status: 400, message: 'Customer info is incomplete.'};
    if(Object.keys(orders).length === 0) throw new Error('Empty order.');

    // insert customer info first
    const [insertedCustomer] = await database.execute(customerStmt.newCustomer, [firstname, lastname, address, fContact, sContact]);
    const customerId = insertedCustomer?.insertId;

    if(customerId > 0) {
        // make it multi insert
        let nForMultiInsertStmt = orderStmt.newOrder;
        const dataToInsert = [];
        const allBarcodes = [];
        for(const key in orders) {
            const order = orders[key];
            const isDiscounted = order?.isDiscounted ? 1 : 0;
            const barcodes = order?.barcodes;

            for(const barcode of barcodes) {
                nForMultiInsertStmt = nForMultiInsertStmt + '(?, ?, ?, ?),';
                dataToInsert.push(barcode);
                dataToInsert.push(isDiscounted);
                dataToInsert.push(customerId);
                dataToInsert.push(paymentMethod);

                allBarcodes.push(barcode);
            }
        }
        nForMultiInsertStmt = nForMultiInsertStmt?.substring(0, nForMultiInsertStmt.length-1) + ';';
        // console.log(dataToInsert, nForMultiInsertStmt);
        // barcode, is_discounted, customer_id, payment_method
        const [insertedOrder] = await database.execute(nForMultiInsertStmt, dataToInsert);
        if(insertedOrder?.insertId > 0) {
            let denominations = undefined;
            if(paymentMethod === 'Cash Payment') {
                // get all items just to compute the amount of purchase
                const [items] = await database.query(itemStmt.excludedSoldItems, []);
                let totalPurchaseAmount = 0;
                for(const item of items) {
                    const key = item?.id;
                    if(orders[key]) {
                        const quantity = orders[key]?.barcodes?.length;
                        const isDiscounted = orders[key]?.isDiscounted;
                        const price = isDiscounted ? item?.maxDiscount : item?.srp;
                        totalPurchaseAmount = totalPurchaseAmount + toNumber(price) * toNumber(quantity);
                    } 
                }

                denominations = payment?.cash?.denominations;
                const wordToNumberDenomination = {onethousand: 1000, fivehundred: 500, twohundred: 200, onehundred: 100, fifty: 50, twenty: 20, ten: 10, five: 5, one: 1};
                let totalPayment = 0; // get the total of denomination
                for(const [bill, count] of Object.entries(denominations)) {
                    totalPayment = totalPayment + wordToNumberDenomination[bill] * toNumber(count);
                }

                const customerChange = totalPayment - totalPurchaseAmount;
                if(customerChange < 0) {
                    throw {status: 400, message: `Insufficient payment. The total amount is ₱${totalPurchaseAmount}, but received only ₱${totalPayment}.`};
                }

                if(Object.keys(wordToNumberDenomination).length !== Object.keys(denominations).length) {
                    throw {status: 400, message: 'Invalid cash denomination'};
                }

                // insert new payment cash denomination
                const [denom] = await database.execute(denominationStmt.newDenomination, Object.values(denominations));
                const denomId = denom?.insertId ?? 0;
                if(denomId > 0) {
                    // save customer payment cash denomination
                    const [cashPayment] = await database.execute(paymentStmt.newCashPayment, [customerId, denomId, totalPayment, customerChange]);
                    if(cashPayment?.insertId > 0) {
                        // query cash drawer contents today
                        const [drawer] = await database.query(cashDrawerStmt.cashDrawer, []);
                        const todaysDrawerCashDenom = drawer[0];
                        // if cash drawer contains money if not create new one
                        if(!todaysDrawerCashDenom) {
                            // first save the cash denomination
                            const [cashDrawerDenom] = await database.execute(denominationStmt.newDenomination, Object.values(denominations));
                            // next is to save the id of the cash denomination in cash drawer
                            const cashDrawerDenomId = cashDrawerDenom?.insertId ?? 0;
                            if(cashDrawerDenomId > 0) {
                                const [newCashDrawer] = await database.execute(cashDrawerStmt.newCashDrawer, [cashDrawerDenomId]);
                            }
                        } else {
                            // get the cash drawer denom in denomination table
                            const denomId = todaysDrawerCashDenom?.cashDenominationId;
                            const [cashDrawerDenom] = await database.execute(denominationStmt.denomination, [denomId]);
                            const currentCashCont = cashDrawerDenom[0];
                            const nDenom = {};
                            for(const [key, value] of Object.entries(currentCashCont)) {
                                const nKey = String(key).toLowerCase().trim();
                                const nValue = toNumber(denominations[nKey]) + toNumber(value);
                                nDenom[nKey] = nValue;
                            }

                            const [updatedCashDrawerDenom] = await database.execute(denominationStmt.updateDenomination, [...Object.values(nDenom), denomId]);
                        }


                    }
                }
            }

            res.status(200).json({results: {
                customerInfo: {
                    firstname,
                    lastname,
                    address,
                    contacts: {
                        first: fContact,
                        second: sContact
                    },
                },
                paymentMethod,
                allBarcodes,
                denominations
            }});
            return;
        }
    }

    throw new Error('There\'s something wrong.');
});

export {
    newOrder,
}
