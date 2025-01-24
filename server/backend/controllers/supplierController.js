import { requestHandler } from '../utils/requestHandler.js';
import { toNumber } from '../utils/number.js';
import { fileExists, getDir } from '../utils/fileDir.js';
import { unlink } from 'fs/promises';
import * as supplierStmt from '../mysql/supplier.js';

/*
   desc     New Supplier
   route    POST /api/suppliers/new
   access   private
*/
const newSupplier = requestHandler(async (req, res, database) => {
    const name = String(req.body?.name).trim();
    const contact = String(req.body?.contact).trim();
    const image = req?.file?.filename || '';

    if(!name) throw {status: 400, message: 'Supplier name is required to add new supplier.'}

    const [insert] = await database.execute(supplierStmt.newSupplier, [name, contact, image]);
    if(insert?.insertId > 0) {
        res.status(201).json({message: 'Inserted successfully.'});
    } else {
        throw {status: 401, message: 'New supplier failed to insert.'};
    }
}, 'Supplier: newSupplier');

/*
   desc     Get Supplier
   route    GET /api/suppliers/get
   access   public
*/
const getSuppliers = requestHandler(async (req, res, database) => {
    const [results] = await database.query(supplierStmt.suppliers, []);
    res.status(200).json({results});
}, 'Supplier: getSuppliers');

/*
   desc     Update Status of Supplier
   route    PATCH /api/suppliers/status
   access   private
*/
const changeSupplierStatus = requestHandler(async (req, res, database) => {
    const id = toNumber(req.body?.id);
    const changeTo = String(req.body?.changeTo).toLowerCase().trim();

    if(!id) throw {status: 404, message: 'Supplier not recognized.'};
    if(changeTo !== 'active' && changeTo !== 'inactive') throw {status: 400, message: 'Error status type of undefined.'};

    const [result] = await database.execute(supplierStmt.changeStatus, [changeTo, id]);
    if(result?.changedRows > 0) {
        res.status(200).json({message: 'Supplier status updated.'});
    } else {
        throw {status: 400, message: 'Updating supplier status failed.'}
    }
}, 'Supplier: changeSupplierStatus');

/*
   desc     Update Supplier
   route    PUT /api/suppliers/update
   access   private
*/
const updateSupplier = requestHandler(async (req, res, database) => {
    const id = toNumber(req.body?.id);
    const name = String(req.body?.name)?.trim();
    const contact = String(req.body?.contact).trim();
    const image = req?.file?.filename;

    if(!id || id===0) throw new Error('There\'s something wrong.');
    if(!name) throw {status: 400, message: 'Supplier name is required to update supplier.'};

    const [result] = await database.query(supplierStmt.supplier, [id]);
    const currentImage = result?.length > 0 ? result[0]?.image : '';
    let newImage = currentImage;
    if(image) {
        newImage = image;
        if(currentImage) {
            const filePath = `uploads/suppliers/${currentImage}`;
            const isFileExists = await fileExists(filePath);
            if(isFileExists) await unlink(getDir(filePath));
        }
    }
    const [update] = await database.execute(supplierStmt.updateSupplier, [name, contact, newImage, id]);
    if(update?.affectedRows > 0) {
        res.status(200).json({message: 'Supplier successfully updated.'});
    } else {
        throw {status: 400, message: 'Updating supplier failed.'}
    }
}, 'Supplier: updateSupplier');

export {
    newSupplier,
    getSuppliers,
    changeSupplierStatus,
    updateSupplier,
};
