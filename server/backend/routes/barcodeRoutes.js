import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import {
    newBarcode,
    deleteBarcode,
} from '../controllers/barcodeController.js';

const router = express.Router();
router.post('/new', protect, newBarcode);
router.delete('/delete', protect, deleteBarcode);

export default router;
