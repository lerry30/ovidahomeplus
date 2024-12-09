import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import {
    getReportByDate,
    getReportByMonth,
    getReportByYear,
} from '../controllers/reportController.js';

const router = express.Router();
router.post('/date', protect, getReportByDate);
router.post('/monthly', protect, getReportByMonth);
router.post('/yearly', protect, getReportByYear);

export default router;