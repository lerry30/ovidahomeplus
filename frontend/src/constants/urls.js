export const apiUrl = 'http://192.168.1.24:4000';

export const urls = {
    signup: `${apiUrl}/api/users/`,
    signin: `${apiUrl}/api/users/auth`,
    user: `${apiUrl}/api/users/user`,
    newsupplier: `${apiUrl}/api/suppliers/new`,
    getsuppliers: `${apiUrl}/api/suppliers/get`,
    updatesupplierstatus: `${apiUrl}/api/suppliers/status`,
    updatesupplier: `${apiUrl}/api/suppliers/update`,
    newproducttype: `${apiUrl}/api/producttypes/new`,
    getproducttypes: `${apiUrl}/api/producttypes/get`,
    updateproducttypestatus: `${apiUrl}/api/producttypes/status`,
    updateproducttype: `${apiUrl}/api/producttypes/update`,
    getproducttypesbystatus: `${apiUrl}/api/producttypes/status`,
    newitem: `${apiUrl}/api/items/new`,
    getitems: `${apiUrl}/api/items/get`,
    getexclude: `${apiUrl}/api/items/exclude`,
    updateitem: `${apiUrl}/api/items/update`,
    disableitem: `${apiUrl}/api/items/status/disable`,
    enableitem: `${apiUrl}/api/items/status/enable`,
    searchitems: `${apiUrl}/api/items/search`,
    getitemsbysupplier: `${apiUrl}/api/items/supplier-based`,
    getitemsbystatus: `${apiUrl}/api/items/status`,
    getbatches: `${apiUrl}/api/batches/get`,
    newbatch: `${apiUrl}/api/batches/new`,
    getbatch: `${apiUrl}/api/batches/batch`,
    getbatchesbysupplier: `${apiUrl}/api/batches/supplier-based`,
    updatebatch: `${apiUrl}/api/batches/update`,
    batchdata: `${apiUrl}/api/batches/batch-data`,
    newbarcode: `${apiUrl}/api/barcodes/new`,
    printbarcode: `${apiUrl}/api/barcodes/print`,
    neworder: `${apiUrl}/api/orders/new`,
    solditemstoday: `${apiUrl}/api/solditems/today`,
    dateofsolditems: `${apiUrl}/api/solditems/date`,
    newexpense: `${apiUrl}/api/expenses/new`,
    getexpensestoday: `${apiUrl}/api/expenses/today`,
    updateexpense: `${apiUrl}/api/expenses/update`,
    deleteexpense: `${apiUrl}/api/expenses/delete`,
    dateofexpenses: `${apiUrl}/api/expenses/date`,
    dateofreport: `${apiUrl}/api/reports/date`,
    monthlyreport: `${apiUrl}/api/reports/monthly`,
    yearlyreport: `${apiUrl}/api/reports/yearly`,
    printpdf: `${apiUrl}/api/reports/print`,
    dashboard: `${apiUrl}/api/dashboard/get`,
    cashdrawer: `${apiUrl}/api/cashdrawer/get`,
    updatecashdrawer: `${apiUrl}/api/cashdrawer/update`,
    dateofcashdenominations: `${apiUrl}/api/cashdrawer/date`,
};
