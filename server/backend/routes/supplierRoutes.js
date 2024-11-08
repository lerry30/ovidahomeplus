import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../utils/multerConfig.js';

import {
    newSupplier,
    getSuppliers,
    changeSupplierStatus,
    updateSupplier,
} from '../controllers/supplierController.js';

const router = express.Router();

(async () => {
    const uploadMiddleware = await upload('suppliers');
    router.post('/new', protect, uploadMiddleware.single('file'), newSupplier);
    router.get('/get', getSuppliers);
    router.put('/status', protect, changeSupplierStatus);
    router.put('/update', protect, uploadMiddleware.single('file'), updateSupplier)
})();

export default router;