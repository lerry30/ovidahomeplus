import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import {
    newBatch,
    getBatches,
    getBatch,
    updateBatch,
} from '../controllers/batchController.js';

const router = express.Router();

router.post('/new', protect, newBatch);
router.get('/get', getBatches);
router.post('/batch', getBatch);
router.put('/update', protect, updateBatch);

export default router;