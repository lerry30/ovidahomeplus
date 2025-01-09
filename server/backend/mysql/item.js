export const items = `
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
        COUNT(barcodes.id) AS quantity,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', barcodes.id,
                'barcode', barcodes.barcode,
                'batchNo', batches.batch_no,
                'deliveryReceiptNo', batches.delivery_reciept_no,
                'deliveryDate', batches.delivery_date,
                'createdAt', barcodes.created_at,
                'updatedAt', barcodes.updated_at
            )
        ) AS barcodes
    FROM items
    INNER JOIN product_types ON items.product_type_id = product_types.id
    INNER JOIN suppliers ON items.supplier_id = suppliers.id
    LEFT JOIN disabled_items ON disabled_items.item_id = items.id
    LEFT JOIN barcodes ON barcodes.item_id = items.id
    LEFT JOIN batches ON batches.id = barcodes.batch_no
    WHERE suppliers.status = 'active'
        AND product_types.status = 'active'
    GROUP BY 
        items.id, suppliers.name, suppliers.contact, suppliers.status,
        product_types.id, product_types.name, items.description,
        items.item_code, items.delivery_price, items.srp,
        items.max_discount, items.unit, items.image,
        items.created_at, items.updated_at, disabled_items.note
    ORDER BY items.updated_at DESC;
`;

export const excludedSoldItems = `
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
        COUNT(barcodes.id) AS quantity,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', barcodes.id,
                'barcode', barcodes.barcode,
                'batchNo', batches.batch_no,
                'deliveryReceiptNo', batches.delivery_reciept_no,
                'deliveryDate', batches.delivery_date,
                'createdAt', barcodes.created_at,
                'updatedAt', barcodes.updated_at
            )
        ) AS barcodes
    FROM items
    INNER JOIN product_types ON items.product_type_id = product_types.id
    INNER JOIN suppliers ON items.supplier_id = suppliers.id
    LEFT JOIN disabled_items ON disabled_items.item_id = items.id
    LEFT JOIN barcodes ON barcodes.item_id = items.id
    LEFT JOIN batches ON batches.id = barcodes.batch_no
    LEFT JOIN sold_items ON sold_items.barcode = barcodes.barcode
    WHERE suppliers.status = 'active'
        AND product_types.status = 'active'
        AND sold_items.barcode IS NULL
        AND disabled_items.item_id IS NULL
    GROUP BY 
        items.id, suppliers.name, suppliers.contact, suppliers.status,
        product_types.id, product_types.name, items.description,
        items.item_code, items.delivery_price, items.srp,
        items.max_discount, items.unit, items.image,
        items.created_at, items.updated_at, disabled_items.note
    HAVING quantity > 0
    ORDER BY items.updated_at DESC;
`;

export const getItemDescription = `
    SELECT 
        items.description
    FROM 
        items
    INNER JOIN 
        product_types ON items.product_type_id = product_types.id
    INNER JOIN 
        suppliers ON items.supplier_id = suppliers.id
    WHERE 
        suppliers.status = 'active' 
        AND product_types.status = 'active'
        AND suppliers.id = ?
        AND product_types.id = ?
    ORDER BY 
        items.updated_at DESC;
`;

export const item = `
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
        COUNT(barcodes.id) AS quantity,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', barcodes.id,
                'barcode', barcodes.barcode,
                'batchNo', batches.batch_no,
                'deliveryReceiptNo', batches.delivery_reciept_no,
                'deliveryDate', batches.delivery_date,
                'createdAt', barcodes.created_at,
                'updatedAt', barcodes.updated_at
            )
        ) AS barcodes
    FROM items
    INNER JOIN product_types ON items.product_type_id = product_types.id
    INNER JOIN suppliers ON items.supplier_id = suppliers.id
    LEFT JOIN disabled_items ON disabled_items.item_id = items.id
    LEFT JOIN barcodes ON barcodes.item_id = items.id
    LEFT JOIN batches ON batches.id = barcodes.batch_no
    WHERE suppliers.status = 'active'
        AND product_types.status = 'active'
        AND items.id = ?
    GROUP BY 
        items.id, suppliers.name, suppliers.contact, suppliers.status,
        product_types.id, product_types.name, items.description,
        items.item_code, items.delivery_price, items.srp,
        items.max_discount, items.unit, items.image,
        items.created_at, items.updated_at, disabled_items.note;
`;

export const searchAndExcludeSoldItems = `
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
        COUNT(barcodes.id) AS quantity,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', barcodes.id,
                'barcode', barcodes.barcode,
                'batchNo', batches.batch_no,
                'deliveryReceiptNo', batches.delivery_reciept_no,
                'deliveryDate', batches.delivery_date,
                'createdAt', barcodes.created_at,
                'updatedAt', barcodes.updated_at
            )
        ) AS barcodes
    FROM items
    INNER JOIN product_types ON items.product_type_id = product_types.id
    INNER JOIN suppliers ON items.supplier_id = suppliers.id
    LEFT JOIN disabled_items ON disabled_items.item_id = items.id
    LEFT JOIN barcodes ON barcodes.item_id = items.id
    LEFT JOIN batches ON batches.id = barcodes.batch_no
    LEFT JOIN sold_items ON sold_items.barcode = barcodes.barcode
    WHERE suppliers.status = 'active'
        AND product_types.status = 'active'
        AND sold_items.barcode IS NULL
        AND (
            product_types.name LIKE CONCAT('%', ?, '%')
            OR items.description LIKE CONCAT('%', ?, '%')
            OR items.item_code LIKE CONCAT('%', ?, '%')
            OR items.max_discount LIKE CONCAT('%', ?, '%')
            OR items.srp LIKE CONCAT('%', ?, '%')
            OR suppliers.name LIKE CONCAT('%', ?, '%')
            OR items.unit LIKE CONCAT('%', ?, '%')
        )
    GROUP BY 
        items.id, suppliers.name, suppliers.contact, suppliers.status,
        product_types.id, product_types.name, items.description,
        items.item_code, items.delivery_price, items.srp,
        items.max_discount, items.unit, items.image,
        items.created_at, items.updated_at, disabled_items.note
    HAVING quantity > 0
    ORDER BY items.updated_at DESC;
`;

export const newItem = `INSERT INTO 
    items (supplier_id, product_type_id, description, item_code, delivery_price, srp, max_discount, unit, image) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;

export const updateItem = `
    UPDATE items 
    SET supplier_id=?, product_type_id=?, description=?, item_code=?, delivery_price=?, srp=?, max_discount=?, unit=?, image=?
    WHERE id=?;
`;
