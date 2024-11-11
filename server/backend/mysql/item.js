

export const newItem = `INSERT INTO 
    items (delivery_id, product_type_id, description, item_code, quantity, barcode, srp, max_discount, unit, image) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;