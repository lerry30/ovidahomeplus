import { requestHandler } from '../utils/requestHandler.js';
import { toNumber, roundToTwo } from '../utils/number.js';
import { isValidDate } from '../utils/datetime.js';
import { generateBarcode } from '../utils/generateBarcode.js';
import { setBarcodeSequence } from '../helper/item.js';
import { unlink } from 'fs/promises';
import { getDir } from '../utils/fileDir.js';
import * as itemStmt from '../mysql/item.js';
import * as deliveryStmt from '../mysql/delivery.js';

/*
   desc     New Item
   route    POST /api/items/new
   access   private
*/
const newItem = requestHandler(async (req, res, database) => {
    const productTypeId = toNumber(req.body?.productTypeId);
    const description = req.body?.description?.trim();

    const supplierId = toNumber(req.body?.supplierId);
    const deliveryPrice = toNumber(req.body?.deliveryPrice);
    const deliveryDate = req.body?.deliveryDate; // don't forget to validate date

    const itemCode = req.body?.itemCode?.trim();
    const srp = roundToTwo(toNumber(req.body?.srp));
    const unit = req.body?.unit?.trim();
    const quantity = toNumber(req.body?.quantity);

    const image = req?.file?.filename || '';

    if(!productTypeId) throw {status: 400, message: 'Please select a product type from the dropdown menu.'};
    if(!supplierId) throw {status: 400, message: 'Please select a supplier from the dropdown menu.'};
    if(deliveryPrice <= 0) throw {status: 400, message: 'Delivery price must be greater than zero.'};
    if(!isValidDate(deliveryDate)) throw {status: 400, message: 'Ensure the date is complete and in the correct format.'};
    if(!itemCode) throw {status: 400, message: 'Please provide an item code.'};
    if(srp <= 0) throw {status: 400, message: 'SRP must be greater than zero.'};
    if(!unit) throw {status: 400, message: 'Please select units from the dropdown menu.'};
    if(quantity <= 0) throw {status: 400, message: 'Quantity must be greater than zero.'};

    const maxDiscount = srp - srp * 0.05;

    // create barcode
    // get items to verify barcode uniqueness
    const [getItems] = await database.query(itemStmt.items, []);
    const itemBarcode = setBarcodeSequence(productTypeId, getItems);

    const [deliveryInserted] = await database.execute(deliveryStmt.newDelivery, [supplierId, deliveryPrice, deliveryDate]);
    const deliveryId = deliveryInserted?.insertId;
    if(deliveryId > 0) {
        const [itemInserted] = await database.execute(itemStmt.newItem, 
            [deliveryId, productTypeId, description, itemCode, quantity, itemBarcode, srp, maxDiscount, unit, image]);
        if(itemInserted?.insertId > 0) {
            generateBarcode(itemBarcode);
            res.status(201).json({message: 'Inserted successfully.'});
            return;
        }
    }

    throw {status: 401, message: 'New item failed to insert.'};
});

/*
   desc     Get items
   route    GET /api/items/get
   access   public
*/
const getItems = requestHandler(async (req, res, database) => {
    const [results] = await database.query(itemStmt.items, []);
    res.status(200).json({results});
});

/*
   desc     Update items
   route    PUT /api/items/update
   access   private
*/
const updateItem = requestHandler(async (req, res, database) => {
    const itemId = toNumber(req.body?.id);
    const productTypeId = toNumber(req.body?.productTypeId);
    const description = req.body?.description?.trim();

    const supplierId = toNumber(req.body?.supplierId);
    const deliveryPrice = toNumber(req.body?.deliveryPrice);
    const deliveryDate = req.body?.deliveryDate; // don't forget to validate date

    const itemCode = req.body?.itemCode?.trim();
    const srp = roundToTwo(toNumber(req.body?.srp));
    const unit = req.body?.unit?.trim();
    const quantity = toNumber(req.body?.quantity);

    let image = req?.file?.filename || '';

    if(!productTypeId) throw {status: 400, message: 'Please select a product type from the dropdown menu.'};
    if(!supplierId) throw {status: 400, message: 'Please select a supplier from the dropdown menu.'};
    if(deliveryPrice <= 0) throw {status: 400, message: 'Delivery price must be greater than zero.'};
    if(!isValidDate(deliveryDate)) throw {status: 400, message: 'Ensure the date is complete and in the correct format.'};
    if(!itemCode) throw {status: 400, message: 'Please provide an item code.'};
    if(srp <= 0) throw {status: 400, message: 'SRP must be greater than zero.'};
    if(!unit) throw {status: 400, message: 'Please select units from the dropdown menu.'};
    if(quantity <= 0) throw {status: 400, message: 'Quantity must be greater than zero.'};

    const maxDiscount = srp - srp * 0.05;

    // get items to verify barcode uniqueness
    const [getItems] = await database.query(itemStmt.items, []);

    let itemBarcode = undefined;
    let isBarcodeChange = false;
    let deliveryId = undefined;
    let prevBarcode = '';
    for(let i = 0; i < getItems.length; i++) {
        const item = getItems[i];
        if(item?.id === itemId) {
            itemBarcode = item?.barcode;
            deliveryId = item?.deliveryId;
            prevBarcode = item?.barcode;

            if(!image) image = item?.image;
            if(item?.productTypeId !== productTypeId) {
                itemBarcode = setBarcodeSequence(productTypeId, getItems);
                isBarcodeChange = true;
            }

            break;
        }
    }

    const [deliveryUpdated] = await database.execute(deliveryStmt.updateDelivery, [supplierId, deliveryPrice, deliveryDate, deliveryId]);
    if(deliveryUpdated.affectedRows > 0) {
        const [itemUpdated] = await database.execute(itemStmt.updateItem, 
            [deliveryId, productTypeId, description, itemCode, quantity, itemBarcode, srp, maxDiscount, unit, image, itemId]);
        if(itemUpdated?.affectedRows > 0) {
            if(isBarcodeChange) {
                await unlink(getDir(`uploads/barcodes/${prevBarcode}.png`));
                generateBarcode(itemBarcode);
            }
            res.status(201).json({message: 'Inserted successfully.'});
            return;
        }
    }

    throw {status: 401, message: 'Updating item failed.'};
});

export {
    newItem,
    getItems,
    updateItem,
};