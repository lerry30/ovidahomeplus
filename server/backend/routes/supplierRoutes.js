import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import {
    newSupplier
} from '../controllers/supplierController.js';

const router = express.Router();

router.post('/new', protect, newSupplier);

export default router;