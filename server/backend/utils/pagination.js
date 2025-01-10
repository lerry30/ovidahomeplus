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
