import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import { 
    authUser, 
    registerUser,
    getUser,
} from '../controllers/userController.js';

const router = express.Router();

router.post('/', registerUser);
router.post('/auth', authUser);
router.get('/user', protect, getUser);

export default router;
