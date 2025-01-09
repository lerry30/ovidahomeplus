import express from 'express';

import {
    printBarcode,
    printAllBarcodes
} from '../controllers/barcodeController.js';

const router = express.Router();
router.post('/print', printBarcode);
router.post('/printall', printAllBarcodes);

export default router;
