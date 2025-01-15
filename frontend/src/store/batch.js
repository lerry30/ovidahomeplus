import { create } from 'zustand';
import { batch as localStorageName } from '@/constants/localStorageNames';
import { toNumber } from '@/utils/number';

export const zBatch = create(set => ({
    id: 0,
    supplierId: 0,
    supplierName: '',
    batchNo: 0,
    date: '',

    saveBatchData: (id, supplierId, supplierName, batchNo, date) => {
        if(!id || !supplierId || !supplierName || !batchNo || !date) {
            console.log('Batch info has an empty value.');
            return;
        }

        const dataSet = {
            id: toNumber(id),
            supplierId: toNumber(supplierId),
            supplierName: String(supplierName).trim(), 
            batchNo: toNumber(batchNo),
            date: String(date).trim()
        };
        localStorage.setItem(localStorageName, JSON.stringify(dataSet));
        set(dataSet);
    },

    reloadBatchData: () => {
        const {id, supplierId, supplierName, batchNo, date} = JSON.parse(localStorage.getItem(localStorageName) || '{}');
        if(id && supplierId && supplierName && batchNo && date) {
            set({id, supplierId, supplierName, batchNo, date});
        }
    },

    wipeOutData: () => {
        set({
            id: 0,
            supplierId: 0,
            supplierName: '',
            batchNo: 0,
            date: '',
        }); 
    }
}));
