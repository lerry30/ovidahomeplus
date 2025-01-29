import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { storeFileInMemory } from '../middleware/storeFileInMemory.js';
import { reduceImageQuality } from '../middleware/reduceQuality.js';

import {
    newProductType,
    getProductTypes,
    changeProductTypeStatus,
    updateProductType,
    getProductTypesByStatus,
    searchProductTypes, 
} from '../controllers/productTypeController.js';

const router = express.Router();

const uploadMiddleware = [storeFileInMemory, reduceImageQuality('producttypes')]
router.post('/new', protect, uploadMiddleware, newProductType);
router.get('/get', getProductTypes);
router.patch('/status', protect, changeProductTypeStatus);
router.put('/update', protect, uploadMiddleware, updateProductType);
router.get('/status', getProductTypesByStatus);
router.post('/search', protect, searchProductTypes);

export default router;
