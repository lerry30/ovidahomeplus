export const apiUrl = 'http://localhost:4000';

export const urls = {
    signup: `${apiUrl}/api/users/`,
    signin: `${apiUrl}/api/users/auth`,
    user: `${apiUrl}/api/users/user`,
    newsupplier: `${apiUrl}/api/suppliers/new`,
    getsuppliers: `${apiUrl}/api/suppliers/get`,
    updatesupplierstatus: `${apiUrl}/api/suppliers/status`,
    updatesupplier: `${apiUrl}/api/suppliers/update`,
    newproducttype: `${apiUrl}/api/producttype/new`,
    getproducttypes: `${apiUrl}/api/producttype/get`,
    updateproducttypestatus: `${apiUrl}/api/producttype/status`,
    updateproducttype: `${apiUrl}/api/producttype/update`,
    newitem: `${apiUrl}/api/items/new`,
};