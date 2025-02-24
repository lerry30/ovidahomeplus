import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import {
    newBatch,
    getBatches,
    getBatch,
    updateBatch,
    getBatchWithData,
    getBatchesBySupplier,
    getBatchWithNumberOfBarcodes
} from '../controllers/batchController.js';

const router = express.Router();

router.post('/new', protect, newBatch);
router.post('/batch', getBatch);
router.post('/batch-data', protect, getBatchWithData);
router.post('/supplier-based', protect, getBatchesBySupplier);
router.get('/get', getBatches);
router.put('/update', protect, updateBatch);
router.post('/getnumberofbarcodes', protect, getBatchWithNumberOfBarcodes);

export default router;
