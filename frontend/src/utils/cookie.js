

export const checkCookieExists = (cookieName) => {
    const cookies = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${cookieName}=`));
    // Returns true if the cookie exists, otherwise false
    return !!cookies;
};