import bwipjs from 'bwip-js';
import fs from 'fs';
import { getDir } from './fileDir.js';

export const generateBarcode = (text) => {
    if(!text) throw new Error('Error barcode text is not defined.');
    return new Promise((resolve, reject) => {
        bwipjs.toBuffer({
            bcid: 'code128',       // Barcode type
            text: text,            // Text to encode
            scale: 3,              // Scale factor
            height: 10,            // Bar height, in millimeters
            includetext: true,     // Show the text below the barcode
            textxalign: 'center',  // Center the text
        }, (err, png) => {
            if (err) {
                const error = `Error ${err}`;
                reject(error);
                console.error(error);
            } else {
                const path = `${getDir('uploads/barcodes')}/${text}.png`;
                fs.writeFileSync(path, png);
                resolve('Barcode is created');
                console.log('Barcode is created');
            }
        });
    });
}
