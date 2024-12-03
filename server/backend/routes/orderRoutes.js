import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import {
    newOrder
} from '../controllers/orderController.js';

const router = express.Router();
router.post('/new', protect, newOrder);

export default router;