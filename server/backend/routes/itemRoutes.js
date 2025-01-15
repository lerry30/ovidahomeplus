import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { storeFileInMemory } from '../middleware/storeFileInMemory.js';
import { reduceImageQuality } from '../middleware/reduceQuality.js';

import {
    newItem,
    getItems,
    getExcludedSoldItems,
    updateItem,
    disableItem,
    enableItem,
    searchItems,
    getItemsByStatus,
    getItemsBySupplier,
} from '../controllers/itemController.js';

const router = express.Router();

const uploadMiddleware = [storeFileInMemory, reduceImageQuality('items')]
router.post('/new', protect, uploadMiddleware, newItem);
router.get('/get', getItems);
router.get('/exclude', getExcludedSoldItems);
router.put('/update', protect, uploadMiddleware, updateItem);
router.patch('/status/disable', protect, disableItem);
router.patch('/status/enable/', protect, enableItem);
router.post('/search', protect, searchItems);
router.get('/status', getItemsByStatus);
router.post('/supplier-based', protect, getItemsBySupplier);

export default router;
