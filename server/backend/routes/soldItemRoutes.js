import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import {
    getSoldItemsToday
} from '../controllers/soldItemController.js';

const router = express.Router();

router.get('/today', getSoldItemsToday);

export default router;