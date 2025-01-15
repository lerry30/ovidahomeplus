import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

const sendToPrinter = async (zplCommand, printerName = 'Honeywell_Thermal') => {
    try {
        const command = `echo "${zplCommand}" | lp -d ${printerName}`;
        const { stdout, stderr } = await execAsync(command);
        
        if (stderr) {
            throw new Error(`Printing error: ${stderr}`);
        }
        
        return stdout;
    } catch (error) {
        throw new Error(`Failed to print: ${error.message}`);
    }
};

const printBarcodeWithText = async (barcodeData, textLines = [], options = {}) => {
     const {
        x = 110,
        y = 50,
        height = 220,
        width = 5,
        barcodeType = 'B3', // Code 128
        humanReadable = 'Y',
        printerName = 'Honeywell_Thermal',
        textFontHeight = 12,
        textFontWidth = 8,
        lineSpacing = 24  // Space between lines
    } = options;

    // Start with barcode ZPL
    let zpl = `^XA
        ^FO${x},${y}
        ^BY${width}
        ^B${barcodeType},${height},${humanReadable},N,N
        ^FD${barcodeData}^FS`;

    // Add each line of text
    textLines.forEach((text, index) => {
        const yPosition = y + height + (lineSpacing * (index + 1));
        zpl += `
            ^FO${x},${yPosition}
            ^ADN,${textFontHeight},${textFontWidth}
            ^FD${text}^FS`;
    });

    // Close ZPL command
    zpl += '\n^XZ';

    return sendToPrinter(zpl, printerName);
};

const printText = async (text, options = {}) => {
    const {
        x = 50,
        y = 50,
        fontHeight = 36,
        fontWidth = 20,
        printerName = 'Honeywell_Thermal'
    } = options;

    const zpl = `^XA
        ^FO${x},${y}
        ^ADN,${fontHeight},${fontWidth}
        ^FD${text}^FS
        ^XZ`;

    return sendToPrinter(zpl, printerName);
};

export { printBarcodeWithText, printText, sendToPrinter };
