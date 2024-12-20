import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { storeFileInMemory } from '../middleware/storeFileInMemory.js';
import { reduceImageQuality } from '../middleware/reduceQuality.js';

import {
    newSupplier,
    getSuppliers,
    changeSupplierStatus,
    updateSupplier,
} from '../controllers/supplierController.js';

const router = express.Router();

const uploadMiddleware = [storeFileInMemory, reduceImageQuality('suppliers')]
router.post('/new', protect, uploadMiddleware, newSupplier);
router.get('/get', getSuppliers);
router.patch('/status', protect, changeSupplierStatus);
router.put('/update', protect, uploadMiddleware, updateSupplier);

export default router;
