import connectToDB from '../config/db.js';
import { getDir, isDirExists } from './fileDir.js';
import { appendFile, mkdir } from 'fs/promises';

const saveErrorLogs = async (logs) => {
    const rootPath = getDir('uploads/logs');
    const exists = await isDirExists(rootPath);
    if(!exists) await mkdir(rootPath);
    
    const fileName = 'errors.txt';
    await appendFile(`${rootPath}/${fileName}`, logs);
}

export const requestHandler = (controller, origin='not set') => {
    return async (req, res, next) => {
        let database = null;

        try {
            const pool = await connectToDB();
            database = await pool.getConnection();
            await database.beginTransaction();
            await controller(req, res, database, next);

            await database.commit();
        } catch(error) {
            let message = error?.message;
            let status = error?.status || 500;

            const now = new Date()
                .toLocaleString('en-US', {timeZone: process.env.TIMEZONE});
            const log = `\n----Error----\n${message}\n    Origin: ${origin}\n    Timestamp: ${now}`
            await saveErrorLogs(log);
            console.log(log);

            if(error instanceof Error) message = 'There\'s something wrong.';

            if(database)
                await database.rollback();

            res.status(status).json({message});
        } finally {
            if(database)
                await database.release();
        }
    }
}
