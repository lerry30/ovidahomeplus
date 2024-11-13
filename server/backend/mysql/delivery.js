

export const newDelivery = 'INSERT INTO deliveries(supplier_id, price, date) VALUES(?, ?, ?);';
export const updateDelivery = 'UPDATE deliveries SET supplier_id=?, price=?, date=? WHERE id=?;';