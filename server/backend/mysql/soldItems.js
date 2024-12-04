export const soldItems = `
    SELECT
        id,
    	barcode,
    	is_discounted AS isDiscounted,
    	customer_id AS customerId,
    	payment_method AS paymentMethod
    FROM sold_items;
`;