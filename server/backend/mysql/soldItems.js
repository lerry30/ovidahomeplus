export const soldItems = `
    SELECT
        id,
    	barcode,
    	is_discounted AS isDiscounted,
    	customer_id AS customerId,
    	payment_method AS paymentMethod
    FROM sold_items;
`;

export const getSoldItemsToday = `
    SELECT 
        sold_items.id AS soldItemId,
        sold_items.barcode,
        sold_items.is_discounted AS isDiscounted,
        sold_items.payment_method AS paymentMethod,
        sold_items.created_at AS soldAt,
        
        customers.firstname,
        customers.lastname,
        customers.address,
        customers.first_contact_no AS firstContactNo,
        customers.second_contact_no AS secondContactNo,

        items.description AS itemDescription,
        items.item_code AS itemCode,
        items.srp,
        items.delivery_price AS deliveryPrice,
        items.max_discount AS maxDiscount,
        items.unit,
        items.image AS itemImage,

        suppliers.name AS supplierName,
        suppliers.contact AS supplierContact,
        suppliers.status AS supplierStatus,
        
        product_types.id AS productTypeId,
        product_types.name AS productTypeName,
        product_types.status AS productTypeStatus,

        barcodes.batch_no AS batchNo,
        batches.delivery_reciept_no AS deliveryReceiptNo,
        batches.delivery_date AS deliveryDate
    FROM sold_items
    JOIN barcodes ON sold_items.barcode = barcodes.barcode
    JOIN items ON barcodes.item_id = items.id
    JOIN customers ON sold_items.customer_id = customers.id
    LEFT JOIN suppliers ON items.supplier_id = suppliers.id
    LEFT JOIN product_types ON items.product_type_id = product_types.id
    LEFT JOIN batches ON batches.id = barcodes.batch_no
    WHERE DATE(sold_items.created_at) = CURDATE()
      AND suppliers.status = 'active'
      AND product_types.status = 'active'
    ORDER BY sold_items.created_at DESC;
`;

export const getSoldItemsByDate = `
    SELECT 
        sold_items.id AS soldItemId,
        sold_items.barcode,
        sold_items.is_discounted AS isDiscounted,
        sold_items.payment_method AS paymentMethod,
        sold_items.created_at AS soldAt,
        
        customers.firstname,
        customers.lastname,
        customers.address,
        customers.first_contact_no AS firstContactNo,
        customers.second_contact_no AS secondContactNo,

        items.description AS itemDescription,
        items.item_code AS itemCode,
        items.srp,
        items.delivery_price AS deliveryPrice,
        items.max_discount AS maxDiscount,
        items.unit,
        items.image AS itemImage,

        suppliers.name AS supplierName,
        suppliers.contact AS supplierContact,
        suppliers.status AS supplierStatus,
        
        product_types.id AS productTypeId,
        product_types.name AS productTypeName,
        product_types.status AS productTypeStatus,

        barcodes.batch_no AS batchNo,
        batches.delivery_reciept_no AS deliveryReceiptNo,
        batches.delivery_date AS deliveryDate
    FROM sold_items
    JOIN barcodes ON sold_items.barcode = barcodes.barcode
    JOIN items ON barcodes.item_id = items.id
    JOIN customers ON sold_items.customer_id = customers.id
    LEFT JOIN suppliers ON items.supplier_id = suppliers.id
    LEFT JOIN product_types ON items.product_type_id = product_types.id
    LEFT JOIN batches ON batches.id = barcodes.batch_no
    WHERE DATE(sold_items.created_at) = ?
      AND suppliers.status = 'active'
      AND product_types.status = 'active'
    ORDER BY sold_items.created_at DESC;
`;