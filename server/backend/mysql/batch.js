export const batches = `
    SELECT
        batches.id AS batchId,
        suppliers.id AS supplierId,
        suppliers.name AS supplierName,
        batches.batch_no AS batchNo, 
        batches.delivery_receipt_no AS deliveryReceiptNo, 
        batches.delivery_date AS deliveryDate
    FROM batches
    LEFT JOIN suppliers ON suppliers.id = batches.supplier_id;
`;

export const batch = `
    SELECT
        batches.id AS batchId,
        suppliers.id AS supplierId,
        suppliers.name AS supplierName,
        batches.batch_no AS batchNo, 
        batches.delivery_receipt_no AS deliveryReceiptNo, 
        batches.delivery_date AS deliveryDate
    FROM batches
    LEFT JOIN suppliers ON suppliers.id = batches.supplier_id
    WHERE batches.id = ?;
`;

// just to check if the batch exists
export const getBatch = `
    SELECT
        batches.id AS batchId,
        suppliers.name AS supplierName,
        batches.batch_no AS batchNo, 
        batches.delivery_receipt_no AS deliveryReceiptNo, 
        batches.delivery_date AS deliveryDate
    FROM batches
    LEFT JOIN suppliers ON suppliers.id = batches.supplier_id
    WHERE batches.supplier_id = ? 
        AND batches.batch_no = ? 
        AND batches.delivery_date = ?
        AND batches.delivery_receipt_no = ?;
`;

export const getAssociatedToBatch = `
    SELECT
        items.id,
        suppliers.name AS supplierName,
        suppliers.contact AS supplierContact,
        suppliers.status AS supplierStatus,
        product_types.id AS productTypeId,
        product_types.name AS productTypeName,
        items.description,
        items.item_code AS itemCode,
        items.delivery_price AS deliveryPrice,
        items.srp,
        items.max_discount AS maxDiscount,
        items.unit,
        items.image,
        items.created_at AS createdAt,
        items.updated_at AS updatedAt,
        disabled_items.note AS disabledNote,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', barcodes.id,
                'barcode', barcodes.barcode,
                'batchId', batches.id,
                'deliveryReceiptNo', batches.delivery_receipt_no,
                'deliveryDate', batches.delivery_date,
                'createdAt', barcodes.created_at,
                'updatedAt', barcodes.updated_at,
                'isSold', CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM sold_items
                        WHERE sold_items.barcode = barcodes.barcode
                    ) THEN 1
                    ELSE 0
                END
            )
        ) AS barcodes
    FROM batches
    LEFT JOIN barcodes ON barcodes.batch_id = batches.id
    LEFT JOIN items ON items.id = barcodes.item_id
    LEFT JOIN disabled_items ON disabled_items.item_id = items.id
    INNER JOIN product_types ON items.product_type_id = product_types.id
    INNER JOIN suppliers ON items.supplier_id = suppliers.id
    WHERE suppliers.status = 'active' 
        AND product_types.status = 'active'
        AND batches.id = ?
    GROUP BY
        items.id, suppliers.name, suppliers.contact, suppliers.status,
        product_types.id, product_types.name, items.description,
        items.item_code, items.delivery_price, items.srp,
        items.max_discount, items.unit, items.image,
        items.created_at, items.updated_at, disabled_items.note;
`;

export const getBatchesBySupplier = `
    SELECT
        batches.id AS batchId,
        suppliers.name AS supplierName,
        batches.batch_no AS batchNo, 
        batches.delivery_receipt_no AS deliveryReceiptNo, 
        batches.delivery_date AS deliveryDate
    FROM batches
    LEFT JOIN suppliers ON suppliers.id = batches.supplier_id
    WHERE batches.supplier_id = ?;
`;

export const newBatch = 'INSERT INTO batches(supplier_id, batch_no, delivery_receipt_no, delivery_date) VALUES(?, ?, ?, ?);';

export const updateBatch = `
    UPDATE batches
    SET supplier_id=?, batch_no=?, delivery_receipt_no=?, delivery_date=?
    WHERE id=?;
`;
