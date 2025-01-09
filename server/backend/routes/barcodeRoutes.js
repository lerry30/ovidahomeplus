import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import {
    newBarcode,
    printBarcode,
} from '../controllers/barcodeController.js';

const router = express.Router();
router.post('/new', protect, newBarcode);
router.post('/print', protect, printBarcode);

export default router;
