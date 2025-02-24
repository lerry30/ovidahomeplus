export const cashDrawer = `
    SELECT
        cash_denomination_id AS cashDenominationId
    FROM cash_drawer_contents
    WHERE DATE(created_at) = CURDATE();
`;

export const getCashDrawerByDate = `
    SELECT 
        cash_denomination_id AS cashDenominationId
    FROM cash_drawer_contents
    WHERE DATE(created_at) = ?;
`;

export const getCashDrawerBetweenDates = `
    SELECT 
        cash_denomination_id AS cashDenominationId
    FROM cash_drawer_contents
    WHERE DATE(created_at) BETWEEN ? AND ?
`;

export const newCashDrawer = 'INSERT INTO cash_drawer_contents(cash_denomination_id) VALUES(?);';
