export const checkDescription = (toInsert, descriptions) => {
    const toInsertDescription = toInsert?.split(',') ?? []; // from user input
    // array of descriptions to object
    const toInsertDescriptionObject = toInsertDescription.reduce((obj, key) => ({...obj, [String(key).trim().toLowerCase()]: true}), {});

    const nDescriptions = descriptions?.map(item => item?.description); // from database and format it by getting single string from every item

    for(const desc of nDescriptions) {
        const itemDescriptions = desc?.split(',') ?? [];
        if(toInsertDescription.length !== itemDescriptions.length) continue;
        let count = 0;
        for(const itemDesc of itemDescriptions) {
            if(toInsertDescriptionObject[String(itemDesc).trim().toLocaleLowerCase()]) {
                count++;
            }
        }

        if(count === itemDescriptions.length) {
            throw {status: 400, message: 'The item already exists.'}
        }
    }
}

export const setPaginate = (limit, offset, stmt) => {
    const str = String(stmt).trim();
    let nOffset = null;
    // Calculate offset
    if (limit && offset) nOffset = (offset - 1) * limit;
    // Add LIMIT and OFFSET dynamically
    let sqlQuery = str.endsWith(';') ? str.substring(0, str.length-1) : str;
    if (limit) {
        sqlQuery += ` LIMIT ?`;
        if (nOffset !== null) {
            sqlQuery += ` OFFSET ?`;
        }
    }
    // Prepare query parameters
    const queryParams = [];
    if (limit) queryParams.push(limit);
    if (nOffset !== null) queryParams.push(nOffset);
    return {sqlQuery, queryParams};
}

