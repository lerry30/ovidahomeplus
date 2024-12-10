// customers for dashboard
export const uniqueCustomersQuery = `
    SELECT DISTINCT
        firstname,
        lastname,
        address,
        first_contact_no AS firstContactNo,
        second_contact_no AS secondContactNo,
        created_at AS createdAt
    FROM customers;
`;

export const newCustomer = 'INSERT INTO customers(firstname, lastname, address, first_contact_no, second_contact_no) VALUES(?, ?, ?, ?, ?);';




// To select unique customers based on their details such as firstname, lastname, address, or 
// contact numbers, you can use the DISTINCT keyword in your SQL query. Here’s an updated query:

// const uniqueCustomersQuery = `
//     SELECT DISTINCT
//         firstname,
//         lastname,
//         address,
//         first_contact_no AS firstContactNo,
//         second_contact_no AS secondContactNo,
//         created_at AS createdAt
//     FROM customers;
// `;

// Explanation:
// DISTINCT ensures only unique rows are returned based on all the selected columns.
// Variable Name Update: Renamed to uniqueCustomersQuery to better reflect the query's purpose.
// If you want to determine uniqueness based only on specific fields (e.g., name and address), 
// you can adjust the query accordingly:

// const uniqueCustomersQuery = `
//     SELECT
//         firstname,
//         lastname,
//         address,
//         MIN(created_at) AS createdAt,
//         MIN(first_contact_no) AS firstContactNo,
//         MIN(second_contact_no) AS secondContactNo
//     FROM customers
//     GROUP BY firstname, lastname, address;
// `;
// This groups customers with the same firstname, lastname, and address while selecting the earliest 
// created_at and the first contact numbers.