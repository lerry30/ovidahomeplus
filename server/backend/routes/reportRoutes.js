import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import {
    getReportByDate,
    getReportByMonth,
    getReportByYear,
    generatePDF,
} from '../controllers/reportController.js';

const router = express.Router();
router.post('/date', protect, getReportByDate);
router.post('/monthly', protect, getReportByMonth);
router.post('/yearly', protect, getReportByYear);
router.post('/print', protect, generatePDF);

export default router;