// for dashboard
export const barcodes = `
    SELECT
        id,
        item_id,
	    batch_no,
	    barcode,
	    created_at,
	    updated_at
    FROM barcodes;
`;

// this statement will be use for multi insert of items so controller will be in charge of setting it
export const newBarcode = 'INSERT INTO barcodes(item_id, batch_no, barcode) VALUES';