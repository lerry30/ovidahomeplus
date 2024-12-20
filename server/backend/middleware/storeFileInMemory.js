import multer from 'multer';

export const storeFileInMemory = 
    multer({ storage: multer.memoryStorage() }) // store file in memory for processing
        .single('file'); // Process the file before sharp
