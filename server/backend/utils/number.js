export const toNumber = (value) => {
    try {
        const cNumber = Number(value);
        return isNaN(cNumber) ? Number(value.replace(/[^0-9.]/g, '')) : cNumber;
    } catch(error) {
        return 0;
    }
}

export const roundToTwo = (number) => {
    return Math.round(number * 100) / 100;
}
