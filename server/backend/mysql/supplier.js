export const suppliers = `
    SELECT 
        id,
        name,
        contact,
        image,
        status,
        created_at AS createdAt
    FROM suppliers
    ORDER BY created_at DESC;
`;

export const supplier = `
    SELECT 
        id,
        name,
        contact,
        image,
        status,
        created_at AS createdAt
    FROM suppliers
    WHERE id=?;
`;

export const newSupplier = 'INSERT INTO suppliers(name, contact, image) VALUES(?, ?, ?);';
export const changeStatus = 'UPDATE suppliers SET status=? WHERE id=?;'
export const updateSupplier = 'UPDATE suppliers SET name=?, contact=?, image=? WHERE id=?;';