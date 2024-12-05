import express from 'express';
// import { protect } from '../middleware/authMiddleware.js';

import {
    getSoldItemsToday,
    getSoldItemsByDate
} from '../controllers/soldItemController.js';

const router = express.Router();

router.get('/today', getSoldItemsToday);
router.post('/date', getSoldItemsByDate);

export default router;