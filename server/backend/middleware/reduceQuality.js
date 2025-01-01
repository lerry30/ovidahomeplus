import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { requestHandler } from '../utils/requestHandler.js';
import { getDir, isDirExists } from '../utils/fileDir.js';

export const reduceImageQuality = (uploadsFolder) => {
    return requestHandler(async (req, res, database, next) => {
        //if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        if(req.file) {
            const imageQuality = 4;
            const sharpImageData = await sharp(req.file.buffer)
                .png({ quality: imageQuality })
                .toBuffer(); // Reduce file size
            
            const uploadRootPath = getDir(`uploads/${uploadsFolder}`);
            const exists = await isDirExists(uploadRootPath);
            if(!exists) await mkdir(uploadRootPath);
            
            const fileName = `${Date.now()}.png`;
            await writeFile(`${uploadRootPath}/${fileName}`, sharpImageData);
            req.file = { filename: fileName };
        }
        next();
    });
}
