import { requestHandler } from '../utils/requestHandler.js';
import { toNumber, roundToTwo } from '../utils/number.js';
import { parseOneDeep } from '../utils/jsonParse.js';
import { checkDescription } from '../helper/items.js';
import { setPaginate } from '../utils/pagination.js';
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
}, 'Item: newItem');

/*
   desc     Get items. Sold items are excluded
   route    GET /api/items/get
   access   public
*/
const getItems = requestHandler(async (req, res, database) => {
    const limit = toNumber(req.query?.limit) || null;
    const offset = toNumber(req.query?.offset) || null;
    const {sqlQuery, queryParams} = setPaginate(limit, offset, itemStmt.items);

    const [resultItems] = await database.execute(sqlQuery, queryParams);
    const items = resultItems?.length > 0 ? parseOneDeep(resultItems, ['barcodes']) : [];
    res.status(200).json({ results: items });
}, 'Item: getItems');

/*
   desc     Get items. Sold items and disabled items are excluded and even empty stock
   route    GET /api/items/excluded
   access   public
*/
const getExcludedSoldItems = requestHandler(async (req, res, database) => {
    const limit = toNumber(req.query?.limit) || null;
    const offset = toNumber(req.query?.offset) || null;
    const {sqlQuery, queryParams} = setPaginate(limit, offset, itemStmt.excludedSoldItems);

    const [results] = await database.execute(sqlQuery, queryParams);
    const items = results?.length > 0 ? parseOneDeep(results, ['barcodes']) : [];
    res.status(200).json({results: items});
}, 'Item: getExcludedSoldItems');

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
}, 'Item: updateItem');

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
}, 'Item: disableItem');

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
}, 'Item: enableItem');

/*
   desc     Search for item
   route    POST /api/items/search
   access   private
*/
const searchItems = requestHandler(async (req, res, database) => {
    const input = String(req.body?.input).trim().toLowerCase();
    
    if(!input) throw {status: 400, message: 'Search input cannot be empty.'};

    const terms = input?.split(' ');
    const conditions = terms.map(() => `
        (
            product_types.name LIKE CONCAT('%', ?, '%')
            OR items.description LIKE CONCAT('%', ?, '%')
            OR items.item_code LIKE CONCAT('%', ?, '%')
            OR items.max_discount LIKE CONCAT('%', ?, '%')
            OR items.srp LIKE CONCAT('%', ?, '%')
            OR suppliers.name LIKE CONCAT('%', ?, '%')
            OR items.unit LIKE CONCAT('%', ?, '%')
        )
    `).join(" AND ");

    const sqlStatement = `
        ${itemStmt.multiSearchTerms} 
        AND (${conditions})
        GROUP BY 
            items.id, suppliers.name, suppliers.contact, suppliers.status,
            product_types.id, product_types.name, items.description,
            items.item_code, items.delivery_price, items.srp,
            items.max_discount, items.unit, items.image,
            items.created_at, items.updated_at, disabled_items.note
        ORDER BY items.updated_at DESC;
    `;

    const params = terms.flatMap(term => Array(7).fill(term));
    const [results] = await database.execute(sqlStatement, params);

    const items = results?.length > 0 ? parseOneDeep(results, ['barcodes']) : [];
    res.status(200).json({results: items});  
}, 'Item: searchItems');

/*
   desc     Get items either active or inactive
   route    GET /api/items/status
   access   public
*/
const getItemsByStatus = requestHandler(async (req, res, database) => {
    const limit = toNumber(req.query?.limit) || null;
    const offset = toNumber(req.query?.offset) || null;
    const status = String(req.query?.status).trim();

    let items;
    if(status==='active') {
        const {sqlQuery, queryParams} = setPaginate(limit, offset, itemStmt.items);
        const [resultItems] = await database.query(sqlQuery, queryParams);
        const nList = [];
        for(const item of resultItems) {
            if(item?.disabledNote) continue;
            nList.push(item);
        }
        items = nList;
    } else if(status==='inactive') {
        const [resultItems] = await database.query(itemStmt.items, []);
        const dList = [];
        const nList = [];
        for(const item of resultItems) {
            if(!item?.disabledNote) continue;
            dList.push(item);
        }
        const nLimit = Math.min(limit * offset, resultItems?.length);
        const nOffset = (offset - 1) * limit;
        for(let i = nOffset; i < nLimit; i++) {
            const item = dList[i];
            if(item) nList.push(item);
        }
        items = nList;
    } else {
        throw {status: 400, message: 'Status is required.'}
    }

    const nItems = items?.length > 0 ? parseOneDeep(items, ['barcodes']) : [];
    res.status(200).json({ results: nItems });
}, 'Item: getItemsByStatus');

/*
   desc     Get items for new barcode selection, it is based on supplier
   route    POST /api/items/supplier-based
   access   private
*/
const getItemsBySupplier = requestHandler(async (req, res, database) => {
    const supplierId = toNumber(req.body?.supplierId);
    const limit = toNumber(req.body?.limit) || null;
    const offset = toNumber(req.body?.offset) || null;
    const {sqlQuery, queryParams} = setPaginate(limit, offset, itemStmt.itemsBySupplier);

    if(!supplierId) throw {status: 400, message: 'Undefined supplier'};

    const [resultItems] = await database.execute(sqlQuery, [supplierId, ...queryParams]);
    const items = resultItems?.length > 0 ? parseOneDeep(resultItems, ['barcodes']) : [];
    res.status(200).json({ results: items });
}, 'Item: getItemsBySupplier');

export {
    newItem,
    getItems,
    getExcludedSoldItems,
    updateItem,
    disableItem,
    enableItem,
    searchItems,
    getItemsByStatus,
    getItemsBySupplier,
};
