export const batches = `
    SELECT
        batch_no AS batchNo, 
        delivery_reciept_no AS deliveryRecieptNo, 
        delivery_date AS deliveryDate
    FROM batches;
`;

export const batch = `
    SELECT
        batch_no AS batchNo, 
        delivery_reciept_no AS deliveryRecieptNo, 
        delivery_date AS deliveryDate
    FROM batches
    WHERE batch_no=?;
`;

export const newBatch = 'INSERT INTO batches(batch_no, delivery_reciept_no, delivery_date) VALUES(?, ?, ?);';
export const updateBatch = `
    UPDATE batches
    SET delivery_reciept_no=?, delivery_date=?
    WHERE batch_no=?;
`;