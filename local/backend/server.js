import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import barcodeRoutes from './routes/barcodeRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { getDir } from './utils/fileDir.js';
import { allowResourceAccess } from './middleware/corsFileMiddleware.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors({
    // origin: process.env.FRONTEND_DOMAIN, // for specific ip
    origin: true, // allow any ip
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
}));


// Use Helmet for security
app.use(helmet());
// in order to use req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.use('/local/api/barcodes', barcodeRoutes);

// fall back when route is not found
app.use(notFound);
app.use(errorHandler);

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
