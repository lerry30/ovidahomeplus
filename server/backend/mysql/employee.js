export const username = `
    SELECT
        id AS employeeId,
        firstname,
        lastname,
        username,
        created_at AS createdAt
    FROM employees 
    WHERE username=?;
`;

export const employeeWithPassword = `
    SELECT
        id AS employeeId,
        firstname,
        lastname,
        username,
        password,
        created_at AS createdAt
    FROM employees 
    WHERE username=?;
`;



export const newEmployee = 'INSERT INTO employees(firstname, lastname, username, password) VALUES(?, ?, ?, ?)';