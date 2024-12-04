import express from 'express';
import dotenv from 'dotenv';
import connectToDB from './config/db.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import userRoutes from './routes/userRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import productTypeRoutes from './routes/productTypeRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import barcodeRoutes from './routes/barcodeRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import soldItemRoutes from './routes/soldItemRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { getDir } from './utils/fileDir.js';
import { allowResourceAccess } from './middleware/corsFileMiddleware.js';

dotenv.config();
// database
// if it cannot connect to database, it would run process.exit(1), which terminate the program
connectToDB();

const app = express();
const port = process.env.PORT || 4000;
// Limit repeated requests to public APIs
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});

app.use(cors({
    // origin: process.env.FRONTEND_DOMAIN, // for specific ip
    origin: true, // allow any ip
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
}));


// Use Helmet for security
app.use(helmet());
//app.use(limiter);
// in order to use req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/suppliers', allowResourceAccess, express.static(getDir('uploads/suppliers')));
app.use('/producttypes', allowResourceAccess, express.static(getDir('uploads/producttypes')));
app.use('/items', allowResourceAccess, express.static(getDir('uploads/items')));
app.use('/barcodes', allowResourceAccess, express.static(getDir('uploads/barcodes')));

// routes
app.use('/api/users', userRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/producttypes', productTypeRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/barcodes', barcodeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/solditems', soldItemRoutes);

// fall back when route is not found
app.use(notFound);
app.use(errorHandler);

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
