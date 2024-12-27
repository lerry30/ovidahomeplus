import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import {
    getCashDrawerContents,
    updateCashDrawer,
} from '../controllers/cashDrawerController.js';

const router = express.Router();
router.get('/get', protect, getCashDrawerContents);
router.put('/update', protect, updateCashDrawer);

export default router;
