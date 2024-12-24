export const toNumber = (value) => {
    try {
        const cNumber = Number(value);
        return isNaN(cNumber) ? Number(value.replace(/[^0-9.]/g, '')) : cNumber;
    } catch(error) {
        return 0;
    }
}

export const formattedNumber = (number) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: number % 1 === 0 ? 0 : 2, // Only show decimals if they exist
        maximumFractionDigits: 2,
    }).format(number);
};

export const formattedCurrency = (money) => {
    const nMoney = toNumber(money);
    if(nMoney > 0) return `₱ ${formattedNumber(nMoney)}`;
    if(nMoney < 0) return `-₱ ${formattedNumber(Math.abs(nMoney))}`;
    return '0';
}
