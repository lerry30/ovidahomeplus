import express from 'express';

import {
    getData
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/get', getData);

export default router;