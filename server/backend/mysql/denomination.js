export const denomination = `
    SELECT
        one_thousand AS oneThousand,
        five_hundred AS fiveHundred,
        two_hundred AS twoHundred,
        one_hundred AS oneHundred,
        fifty, 
        twenty, 
        ten, 
        five, 
        one
    FROM cash_denominations
    WHERE id = ?;
`;

// for multi id selection where I used IN to query those ids
export const denominations = `
    SELECT
        one_thousand AS oneThousand,
        five_hundred AS fiveHundred,
        two_hundred AS twoHundred,
        one_hundred AS oneHundred,
        fifty, 
        twenty, 
        ten, 
        five, 
        one,
        created_at AS createdAt
    FROM cash_denominations
    WHERE id IN `;

export const newDenomination = 'INSERT INTO cash_denominations(one_thousand, five_hundred, two_hundred, one_hundred, fifty, twenty, ten, five, one) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);';

export const updateDenomination = 'UPDATE cash_denominations SET one_thousand=?, five_hundred=?, two_hundred=?, one_hundred=?, fifty=?, twenty=?, ten=?, five=?, one=? WHERE id=?;';
