import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import {
    getReportByDate
} from '../controllers/reportController.js';

const router = express.Router();
router.post('/date', protect, getReportByDate);

export default router;