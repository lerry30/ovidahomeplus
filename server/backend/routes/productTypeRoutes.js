import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../utils/multerConfig.js';

import {
    newProductType,
    getProductTypes,
    changeProductTypeStatus,
    updateProductType,
} from '../controllers/productTypeController.js';

const router = express.Router();

(async () => {
    const uploadMiddleware = await upload('producttypes');
    router.post('/new', protect, uploadMiddleware.single('file'), newProductType);
    router.get('/get', getProductTypes);
    router.patch('/status', protect, changeProductTypeStatus);
    router.put('/update', protect, uploadMiddleware.single('file'), updateProductType);
})();

export default router;