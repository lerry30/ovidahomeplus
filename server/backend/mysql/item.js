export const items = `
    SELECT
        items.id,
        
        suppliers.name AS supplierName,
        suppliers.contact AS supplierContact,
        suppliers.status AS supplierStatus,

        deliveries.id AS deliveryId,
        deliveries.price AS deliveryPrice,
        deliveries.date AS deliveryDate,

        product_types.id AS productTypeId,
        product_types.name AS productTypeName,

        items.description,
        items.item_code AS itemCode,
        items.quantity,
        items.barcode,
        items.srp,
        items.max_discount AS maxDiscount,
        items.unit,
        items.image,
        items.created_at AS createdAt,
        items.updated_at AS updatedAt,
        disabled_items.note AS disabledNote
    FROM items
    INNER JOIN deliveries ON items.delivery_id = deliveries.id
    INNER JOIN product_types ON items.product_type_id = product_types.id
    INNER JOIN suppliers ON deliveries.supplier_id = suppliers.id
    LEFT JOIN disabled_items ON disabled_items.item_id = items.id
    WHERE suppliers.status = 'active' 
      AND product_types.status = 'active'
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
//         items.quantity,
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
    items (delivery_id, product_type_id, description, item_code, quantity, barcode, srp, max_discount, unit, image) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

export const updateItem = `
    UPDATE items 
    SET delivery_id=?, product_type_id=?, description=?, item_code=?, quantity=?, barcode=?, srp=?, max_discount=?, unit=?, image=?
    WHERE id=?;
`;