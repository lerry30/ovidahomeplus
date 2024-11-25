import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import {
    newBatch,
    getBatches,
} from '../controllers/batchController.js';

const router = express.Router();

router.post('/new', protect, newBatch);
router.get('/get', getBatches);

export default router;