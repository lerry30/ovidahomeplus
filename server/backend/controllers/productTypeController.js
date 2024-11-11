import { requestHandler } from '../utils/requestHandler.js';
import { toNumber } from '../utils/number.js';
import * as productTypeStmt from '../mysql/productType.js';

/*
   desc     New Product Type
   route    POST /api/producttype/new
   access   private
*/
const newProductType = requestHandler(async (req, res, database) => {
    const name = String(req.body?.name).trim();
    const image = req?.file?.filename || '';

    if(!name) throw {status: 400, message: 'Product type name is required to add new.'}

    const [insert] = await database.execute(productTypeStmt.newProductType, [name, image]);
    if(insert?.insertId > 0) {
        res.status(201).json({message: 'Inserted successfully.'});
    } else {
        throw {status: 401, message: 'New product type failed to insert.'};
    }
});

/*
   desc     Get Product Types
   route    GET /api/producttype/get
   access   public
*/
const getProductTypes = requestHandler(async (req, res, database) => {
    const [results] = await database.query(productTypeStmt.productTypes, []);
    res.status(200).json({results});
});

/*
   desc     Update Status of Product Type
   route    PATCH /api/producttype/status
   access   private
*/
const changeProductTypeStatus = requestHandler(async (req, res, database) => {
    const id = toNumber(req.body?.id);
    const changeTo = String(req.body?.changeTo).toLowerCase().trim();

    if(!id) throw {status: 404, message: 'Product type not recognized.'};
    if(changeTo !== 'active' && changeTo !== 'inactive') throw {status: 400, message: 'Error status type of undefined.'};

    const [result] = await database.execute(productTypeStmt.changeStatus, [changeTo, id]);
    if(result?.changedRows > 0) {
        res.status(200).json({message: 'Product type status updated.'});
    } else {
        throw {status: 400, message: 'Updating product type status failed.'}
    }
});

/*
   desc     Update Product Type
   route    PUT /api/producttype/update
   access   private
*/
const updateProductType = requestHandler(async (req, res, database) => {
    const id = toNumber(req.body?.id);
    const name = String(req.body?.name)?.trim();
    const image = req?.file?.filename;

    console.log(id, name, image);

    if(!id || id===0) throw new Error('There\'s something wrong.');
    if(!name) throw {status: 400, message: 'Product type name is required to update product type.'};

    const [result] = await database.query(productTypeStmt.productType, [id]);
    const currentImage = result?.length > 0 ? result[0]?.image : '';
    const newImage = image ? image : currentImage;
    const [update] = await database.execute(productTypeStmt.updateProductType, [name, newImage, id]);
    if(update?.changedRows > 0) {
        res.status(200).json({message: 'Product type successfully updated.'});
    } else {
        throw {status: 400, message: 'Updating product type failed.'}
    }
});

export {
    newProductType,
    getProductTypes,
    changeProductTypeStatus,
    updateProductType,
};