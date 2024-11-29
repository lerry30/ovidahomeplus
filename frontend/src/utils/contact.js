export const contactNumberInput = (input) => {
    // Remove all non-numeric characters
    let digits = input.replace(/\D/g, '');
    // Restrict to a maximum of 11 digits
    if (digits.length > 11) {
        digits = digits.substring(0, 11);
    }

    // Format only if the digits start with '09' and have at least 4 digits
    if (digits.length >= 4 && digits.startsWith('09')) {
        digits = digits.replace(/(\d{4})(\d{3})?(\d{4})?/, (match, p1, p2, p3) => {
            if (p2 && p3) {
                return `${p1}-${p2}-${p3}`;
            } else if (p2) {
                return `${p1}-${p2}`;
            } else {
                return p1;
            }
        });
    }

    return digits;
}