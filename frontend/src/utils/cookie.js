// this is pointless since cookies will never be accessible
// since cookies should be secured
export const checkCookieExists = (cookieName) => {
    //console.log(document.cookie);
    const cookies = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${cookieName}=`));
    // Returns true if the cookie exists, otherwise false
    return !!cookies;
};
