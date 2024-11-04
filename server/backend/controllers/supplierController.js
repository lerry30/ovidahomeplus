import { requestHandler } from '../utils/requestHandler.js';

/*
   desc     New Supplier
   route    POST /api/suppliers/new
   access   public
*/
const newSupplier = requestHandler(async (req, res, database) => {
    const name = String(req.body?.name).trim();
    const contact = String(req.body?.contact).trim();
    const image = req.body?.image;

    if(!name) throw {status: 400, message: 'Supplier name is required to add new supplier.'}
    console.log(image.size);
});

export {
    newSupplier,
};