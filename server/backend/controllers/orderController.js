import { requestHandler } from '../utils/requestHandler.js';
import * as orderStmt from '../mysql/order.js';
import * as customerStmt from '../mysql/customer.js';

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
    const paymentMethod = String(req.body?.paymentMethod).trim();

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
            }});
            return;
        }
    }

    throw new Error('There\'s something wrong.');
});

export {
    newOrder,
}