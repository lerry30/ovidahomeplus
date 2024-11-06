import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../utils/multerConfig.js';

import {
    newSupplier
} from '../controllers/supplierController.js';

const router = express.Router();

(async () => {
    const uploadMiddleware = await upload('suppliers');
    router.post('/new', protect, uploadMiddleware.single('file'), newSupplier);
})();

export default router;