import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import { 
    newExpense
} from '../controllers/expenseController.js';

const router = express.Router();

router.post('/new', protect, newExpense);

export default router;
