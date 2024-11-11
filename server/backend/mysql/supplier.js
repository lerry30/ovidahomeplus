export const suppliers = `
    SELECT 
        id,
        name,
        contact,
        image,
        status,
        updated_at AS updatedAt
    FROM suppliers
    ORDER BY updated_at DESC;
`;

export const supplier = `
    SELECT 
        id,
        name,
        contact,
        image,
        status,
        updated_at AS updatedAt
    FROM suppliers
    WHERE id=?;
`;

export const newSupplier = 'INSERT INTO suppliers(name, contact, image) VALUES(?, ?, ?);';
export const changeStatus = 'UPDATE suppliers SET status=? WHERE id=?;'
export const updateSupplier = 'UPDATE suppliers SET name=?, contact=?, image=? WHERE id=?;';