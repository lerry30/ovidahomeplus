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

// I also wrap it in try catch block to define the error
// because I wanted to display error message regarding
// duplicate item_code since it is a unique constraint.
export const getDuplicateError = async (callback, errorMessage) => {
    try {
        await callback();
    } catch(error) {
        if(error?.code === 'ER_DUP_ENTRY') throw {status: 400, message: 'Item code already exists.'};
        throw {status: 401, message: errorMessage};
    }
}


