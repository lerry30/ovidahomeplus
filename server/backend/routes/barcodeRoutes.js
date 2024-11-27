import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import {
    newBarcode
} from '../controllers/barcodeController.js';

const router = express.Router();
router.post('/new', protect, newBarcode);

export default router;