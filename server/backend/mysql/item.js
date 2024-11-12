export const items = `
    SELECT
        items.id,

        suppliers.name AS supplierName,
        suppliers.contact AS supplierContact,
        suppliers.status AS supplierStatus,

        deliveries.price AS deliveryPrice,

        product_types.name AS productTypeName,

        items.description,
        items.item_code AS itemCode,
        items.quantity,
        items.barcode,
        items.srp,
        items.max_discount AS maxDiscount,
        items.unit,
        items.status,
        items.image,
        items.created_at AS createdAt,
        items.updated_at AS updatedAt
    FROM items
    INNER JOIN deliveries ON items.delivery_id=deliveries.id
    INNER JOIN product_types ON items.product_type_id=product_types.id
    INNER JOIN suppliers ON deliveries.supplier_id=suppliers.id
    ORDER BY items.updated_at DESC;
`;

export const newItem = `INSERT INTO 
    items (delivery_id, product_type_id, description, item_code, quantity, barcode, srp, max_discount, unit, image) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;