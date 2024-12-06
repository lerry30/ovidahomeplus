import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import { 
    newExpense,
    getExpensesToday,
    updateExpense,
    deleteExpense,
    getExpensesByDate,
} from '../controllers/expenseController.js';

const router = express.Router();

router.post('/new', protect, newExpense);
router.get('/today', getExpensesToday);
router.put('/update', protect, updateExpense);
router.delete('/delete', protect, deleteExpense);
router.post('/date', protect, getExpensesByDate);

export default router;
