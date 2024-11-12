import { requestHandler } from '../utils/requestHandler.js';
import { toNumber } from '../utils/number.js';
import { isValidDate } from '../utils/datetime.js';
import { generateBarcode } from '../utils/generateBarcode.js';
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
    const srp = toNumber(req.body?.srp);
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
    const fCode =  String(productTypeId).padStart(3, '0');
    // get items to verify barcode uniqueness
    const [getItems] = await database.query(itemStmt.items, []);
    const lastItemBarcode = getItems?.length > 0 ? getItems[0]?.barcode?.substring(3) : ''; // get the last item so new barcode will be increment for uniqueness
    
    let itemBarcode = fCode + String(toNumber(lastItemBarcode)+1).padStart(11, '0');
    let maxIteration = 1000;

    // convert to object
    const barcodes = {};
    for(let i = 0; i < getItems.length; i++) {
        const barcode = getItems[i]?.barcode;
        barcodes[barcode] = true;
    }

    while(maxIteration > 0) {
        maxIteration--;
        if(barcodes[itemBarcode]) {
            itemBarcode = fCode + String(toNumber(lastItemBarcode)+1).padStart(11, '0');
        } else {
            break;
        }
    }

    console.log({maxIteration});

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

export {
    newItem,
    getItems,
};