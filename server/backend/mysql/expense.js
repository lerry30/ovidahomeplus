export const getExpensesToday = `
    SELECT 
        id,
        type,
        amount
    FROM expenses
    WHERE DATE(created_at) = CURDATE()
    ORDER BY created_at DESC;
`;

export const getExpensesByDate = `
    SELECT 
        id,
        type,
        amount
    FROM expenses
    WHERE DATE(expenses.created_at) = ?
    ORDER BY expenses.created_at DESC;
`;

export const newExpense = 'INSERT INTO expenses(type, amount) VALUES(?, ?);';
export const updateExpense = 'UPDATE expenses SET type=?, amount=? WHERE id=?;';
export const deleteExpense = 'DELETE FROM expenses WHERE id=?;';