import { requestHandler } from '../utils/requestHandler.js';
import { toNumber } from '../utils/number.js';
import * as supplierStmt from '../mysql/supplier.js';

/*
   desc     New Supplier
   route    POST /api/suppliers/new
   access   public
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
});

const getSuppliers = requestHandler(async (req, res, database) => {
    const [result] = await database.query(supplierStmt.suppliers, []);
    res.status(200).json({result});
});

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
});

const updateSupplier = requestHandler(async (req, res, database) => {
    const id = toNumber(req.body?.id);
    console.log(req.body, id);
    const name = String(req.body?.name)?.trim();
    const contact = String(req.body?.contact).trim();
    const image = req?.file?.filename || '';

    if(!id || id===0) throw new Error('There\'s something wrong.');
    if(!name) throw {status: 400, message: 'Supplier name is required to update supplier.'}

    const [update] = await database.execute(supplierStmt.updateSupplier, [name, contact, image, id]);
    if(update?.changedRows > 0) {
        res.status(200).json({message: 'Supplier successfully updated.'});
    } else {
        throw {status: 400, message: 'Updating supplier failed.'}
    }
});

export {
    newSupplier,
    getSuppliers,
    changeSupplierStatus,
    updateSupplier,
};