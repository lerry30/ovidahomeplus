import { requestHandler } from '../utils/requestHandler.js';
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

export {
    newSupplier,
    getSuppliers,
};