import xlsx from 'xlsx';
import { getDir } from './utils/fileDir.js';

export const testDatabase = () => {
    // Read Excel file
    const file = getDir('sheets.xlsx');
    const workbook = xlsx.readFile(file);

    for(const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        console.log(' -- ', sheetName, '-- ');

        for(const row of data) {
            if(!row?.id) break;
            console.log(row);
        }

        console.log();
    }
}
