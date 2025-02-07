// it could paginate dynamically
export const productTypes = `
    SELECT 
        id,
        name,
        image,
        status,
        updated_at AS updatedAt
    FROM product_types
    ORDER BY updated_at DESC;
`;

export const productTypesByStatus = `
    SELECT 
        id,
        name,
        image,
        status,
        updated_at AS updatedAt
    FROM product_types
    WHERE status = ?
    ORDER BY updated_at DESC;
`;

export const productType = `
    SELECT 
        id,
        name,
        image,
        status,
        updated_at AS updatedAt
    FROM product_types
    WHERE id=?;
`;

export const getProductTypeByName = `
    SELECT 
        id,
        name,
        image,
        status,
        updated_at AS updatedAt
    FROM product_types
    WHERE name=?;
`;

export const searchProductTypes = `
    SELECT
        id,
        name,
        image,
        status,
        updated_at AS updatedAt
    FROM product_types
    WHERE name LIKE CONCAT('%', ?, '%')
    ORDER BY updated_at DESC;
`;

export const newProductType = 'INSERT INTO product_types(name, image) VALUES(?, ?);';
export const changeStatus = 'UPDATE product_types SET status=? WHERE id=?;'
export const updateProductType = 'UPDATE product_types SET name=?, image=? WHERE id=?;';
