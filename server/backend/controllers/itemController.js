import { requestHandler } from '../utils/requestHandler.js';
import { toNumber, roundToTwo } from '../utils/number.js';
import { parseOneDeep } from '../utils/jsonParse.js';
import { checkDescription } from '../helper/items.js';
// import { generateBarcode } from '../utils/generateBarcode.js';
// import { setBarcodeSequence } from '../helper/item.js';
import { getDir, fileExists } from '../utils/fileDir.js';
import { unlink } from 'fs/promises';
import * as itemStmt from '../mysql/item.js';
import * as disabledItemStmt from '../mysql/disabledItem.js';
import * as soldItemStmt from '../mysql/soldItems.js';

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

    const itemCode = req.body?.itemCode?.trim();
    const srp = roundToTwo(toNumber(req.body?.srp));
    const unit = req.body?.unit?.trim();

    const image = req?.file?.filename || '';

    if(!productTypeId) throw {status: 400, message: 'Please select a product type from the dropdown menu.'};
    if(!description) throw {status: 400, message: 'Please include the product description to highlight its unique features.'};
    if(!supplierId) throw {status: 400, message: 'Please select a supplier from the dropdown menu.'};
    if(deliveryPrice <= 0) throw {status: 400, message: 'Delivery price must be greater than zero.'};
    if(!itemCode) throw {status: 400, message: 'Please provide an item code.'};
    if(srp <= 0) throw {status: 400, message: 'SRP must be greater than zero.'};
    if(!unit) throw {status: 400, message: 'Please select units from the dropdown menu.'};

    const maxDiscount = srp - srp * 0.05;

    // to make sure that product description is unique
    const [descriptions] = await database.query(itemStmt.getItemDescription, [supplierId, productTypeId]);
    checkDescription(description, descriptions); // will verify the description uniqueness

    const [itemInserted] = await database.execute(itemStmt.newItem,
        [supplierId, productTypeId, description, itemCode, deliveryPrice, srp, maxDiscount, unit, image]);
    if(itemInserted?.insertId > 0) {
        // generateBarcode(itemBarcode);
        res.status(201).json({message: 'Inserted successfully.'});
        return;
    }

    throw {status: 401, message: 'New item failed to insert.'};
});

/*
   desc     Get items. Sold items are excluded
   route    GET /api/items/get
   access   public
*/
const getItems = requestHandler(async (req, res, database) => {
    const limit = req.body?.limit ?? 5;
    const offset = req.body?.offset ?? 1;
    const nOffset = (offset-1)*limit;
    const [resultItems] = await database.query(itemStmt.items, [limit, nOffset]);
    const items = resultItems?.length > 0 ? parseOneDeep(resultItems, ['barcodes']) : [];
    res.status(200).json({results: items});
});

/*
   desc     Get items. Sold items and disabled items are excluded
   route    GET /api/items/excluded
   access   public
*/
const getExcludedSoldItems = requestHandler(async (req, res, database) => {
    const [results] = await database.query(itemStmt.excludedSoldItems, []);
    const items = results?.length > 0 ? parseOneDeep(results, ['barcodes']) : [];
    res.status(200).json({results: items});
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

    const itemCode = req.body?.itemCode?.trim();
    const srp = roundToTwo(toNumber(req.body?.srp));
    const unit = req.body?.unit?.trim();

    const image = req?.file?.filename || '';

    if(!productTypeId) throw {status: 400, message: 'Please select a product type from the dropdown menu.'};
    if(!description) throw {status: 400, message: 'Please include the product description to highlight its unique features.'};
    if(!supplierId) throw {status: 400, message: 'Please select a supplier from the dropdown menu.'};
    if(deliveryPrice <= 0) throw {status: 400, message: 'Delivery price must be greater than zero.'};
    if(!itemCode) throw {status: 400, message: 'Please provide an item code.'};
    if(srp <= 0) throw {status: 400, message: 'SRP must be greater than zero.'};
    if(!unit) throw {status: 400, message: 'Please select units from the dropdown menu.'};

    const maxDiscount = srp - srp * 0.05;

    const [itemResult] = await database.query(itemStmt.item, [itemId]);
    const currentItem = itemResult?.length > 0 ? itemResult[0] : {};
    const currentImage = currentItem?.image ?? '';
    const currentDescription = currentItem?.description ?? '';

    let newImage = currentImage;
    if(image) {
        newImage = image;
        const filePath = `uploads/items/${currentImage}`;
        const isFileExists = await fileExists(filePath);
        if(isFileExists) await unlink(getDir(filePath)); // delete existing file for updates
    }

    // to make sure that product description is unique
    const [descriptions] = await database.query(itemStmt.getItemDescription, [supplierId, productTypeId]);
    if(currentDescription !== description) checkDescription(description, descriptions); // will verify the description uniqueness

    const [itemUpdated] = await database.execute(itemStmt.updateItem, 
        [supplierId, productTypeId, description, itemCode, deliveryPrice, srp, maxDiscount, unit, newImage, itemId]);
    if(itemUpdated?.affectedRows > 0) {
        // if(isBarcodeChange) {
        //     await unlink(getDir(`uploads/barcodes/${prevBarcode}.png`));
        //     generateBarcode(itemBarcode);
        // }
        res.status(201).json({message: 'Updated successfully.'});
        return;
    }

    throw {status: 401, message: 'Updating item failed.'};
});

/*
   desc     Update Status of Item
   route    PATCH /api/items/status/disable
   access   private
*/
const disableItem = requestHandler(async (req, res, database) => {
    const id = toNumber(req.body?.id);
    const note = String(req.body?.note).trim();

    if(!id) throw {status: 404, message: 'Product item not recognized.'};
    if(!note) throw {status: 400, message: 'Disabling an item requires a note.'}

    const [result] = await database.execute(disabledItemStmt.newInactive, [id, note]);
    if(result?.insertId > 0) {
        res.status(200).json({message: 'Item status updated.'});
    } else {
        throw {status: 400, message: 'Updating item status failed.'}
    }
});

/*
   desc     Update Status of Item
   route    PATCH /api/items/status/enable
   access   private
*/
const enableItem = requestHandler(async (req, res, database) => {
    const id = toNumber(req.body?.id);
    if(!id) throw {status: 404, message: 'Product item not recognized.'};

    const [result] = await database.execute(disabledItemStmt.removeInactive, [id]);
    if(result?.affectedRows > 0) {
        res.status(200).json({message: 'Item status updated.'});
    } else {
        throw {status: 400, message: 'Updating item status failed.'}
    }
});

/*
   desc     Search for item
   route    POST /api/items/search
   access   private
*/
const searchItems = requestHandler(async (req, res, database) => {
    const input = String(req.body?.input).trim().toLowerCase();

    if(!input) throw {status: 400, message: 'Search input cannot be empty.'};

    const [results] = await database.execute(itemStmt.searchAndExcludeSoldItems, 
        [input, input, input, input, input, input, input]);

    const items = results?.length > 0 ? parseOneDeep(results, ['barcodes']) : [];
    res.status(200).json({results: items});  
});

export {
    newItem,
    getItems,
    getExcludedSoldItems,
    updateItem,
    disableItem,
    enableItem,
    searchItems,
};
