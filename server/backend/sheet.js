import xlsx from 'xlsx';
import connectToDB from './config/db.js';
import { getDir } from './utils/fileDir.js';

import { newSupplier } from './mysql/supplier.js';
import { newBarcode } from './mysql/barcode.js';
import { newBatch } from './mysql/batch.js';

const getSqlColumns = () => {
    
}

export const sheetToDatabase = async () => {
    let database = null;
    try {
        const pool = await connectToDB();
        database = await pool.getConnection();
        await database.beginTransaction();

        // Read Excel file
        const file = getDir('sheets.xlsx');
        const workbook = xlsx.readFile(file);

        //console.log(newBarcode.match(/\(([^)]+)\)/));

        for(const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(sheet);

            for(const row of data) {
                if(!row?.id) break;
                console.log(row);
                //const sqlStmt = 
                //await database.execute('', []);
            }
        }

        await database.commit();
    } catch(error) {
        console.log(error);
        if(database)
            await database.rollback();
    } finally {
        if(database)
            await database.release();
    }
}
