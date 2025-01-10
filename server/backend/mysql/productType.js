// I didn't add semicolon at the end since
// it could have pagination dynamically
export const productTypes = `
    SELECT 
        id,
        name,
        image,
        status,
        updated_at AS updatedAt
    FROM product_types
    ORDER BY updated_at DESC
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

export const newProductType = 'INSERT INTO product_types(name, image) VALUES(?, ?);';
export const changeStatus = 'UPDATE product_types SET status=? WHERE id=?;'
export const updateProductType = 'UPDATE product_types SET name=?, image=? WHERE id=?;';
