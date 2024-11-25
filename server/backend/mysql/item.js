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
    LEFT JOIN batches ON batches.id = barcodes.batch_id
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

// export const item = `
//     SELECT
//         items.id,

//         suppliers.name AS supplierName,
//         suppliers.contact AS supplierContact,
//         suppliers.status AS supplierStatus,

//         deliveries.price AS deliveryPrice,
//         deliveries.date AS deliveryDate,

//         product_types.name AS productTypeName,

//         items.description,
//         items.item_code AS itemCode,
//         items.barcode,
//         items.srp,
//         items.max_discount AS maxDiscount,
//         items.unit,
//         items.status,
//         items.image,
//         items.created_at AS createdAt,
//         items.updated_at AS updatedAt
//     FROM items
//     INNER JOIN deliveries ON items.delivery_id=deliveries.id
//     INNER JOIN product_types ON items.product_type_id=product_types.id
//     INNER JOIN suppliers ON deliveries.supplier_id=suppliers.id
//     WHERE items.id=?;
// `;


export const newItem = `INSERT INTO 
    items (supplier_id, product_type_id, description, item_code, delivery_price, srp, max_discount, unit, image) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;

export const updateItem = `
    UPDATE items 
    SET supplier_id=?, product_type_id=?, description=?, item_code=?, delivery_price=?, srp=?, max_discount=?, unit=?, image=?
    WHERE id=?;
`;