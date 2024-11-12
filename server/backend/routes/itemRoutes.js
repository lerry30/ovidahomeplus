import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../utils/multerConfig.js';

import {
    newItem,
} from '../controllers/itemController.js';

const router = express.Router();

(async () => {
    const uploadMiddleware = await upload('items');
    router.post('/new', protect, uploadMiddleware.single('file'), newItem);
})();

export default router;