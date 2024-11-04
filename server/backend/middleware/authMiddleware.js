import jwt from 'jsonwebtoken';

import * as employeeStmt from '../mysql/statements.js';
import { requestHandler } from '../utils/requestHandler.js';

const protect = requestHandler(async (req, res, database, next) => {
    console.log(req.cookies);
    const token = req.cookies.jwt;

    if(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const [id, username] = decoded.value.split('-');
            const [rows] = await database.execute(employeeStmt.employee, [username]);
            if(rows.length > 0) {
                req.user = rows[0];
                next();
            } else {
                res.status(401);
                throw new Error('User not found');
            }
        } catch(error) {
            res.status(401);
            throw new Error('Not authorized, invalid token');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

export { protect };
