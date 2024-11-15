import { create } from 'zustand';
import { toNumber } from '@/utils/number';
import { item as localStorageName } from '@/constants/localStorageNames';

export const zItem = create(set => ({
    id: 0,
    supplierName: '',
    supplierContact: '',
    supplierStatus: '',
    deliveryPrice: 0,
    deliveryDate: '',
    productTypeName: '',
    description: '',
    itemCode: '',
    quantity: 0,
    barcode: '',
    srp: 0,
    maxDiscount: 0,
    unit: '',
    status: '',
    image: '',
    createdAt: '',
    updatedAt: '',

    saveItemData: (data) => {
        if(Object.values(data).length === 0) {
            console.log('Item data is empty');
            return;
        }

        const dataSet = {
            id: toNumber(data?.id),
            supplierName: String(data?.supplierName).trim(),
            supplierContact: String(data?.supplierContact).trim(),
            supplierStatus: String(data?.supplierStatus).trim(),
            deliveryPrice: toNumber(data?.deliveryPrice),
            deliveryDate: String(data?.deliveryDate).trim(),
            productTypeName: String(data?.productTypeName).trim(),
            description: String(data?.description).trim(),
            itemCode: String(data?.itemCode).trim(),
            quantity: toNumber(data?.quantity),
            barcode: String(data?.barcode).trim(),
            srp: toNumber(data?.srp),
            maxDiscount: toNumber(data?.maxDiscount),
            unit: String(data?.unit).trim(),
            status: String(data?.status).trim(),
            image: String(data?.image).trim(),
            createdAt: String(data?.createdAt).trim(),
            updatedAt: String(data?.updatedAt).trim(),
        };

        localStorage.setItem(localStorageName, JSON.stringify(dataSet));
        set(dataSet)
    },

    reloadItemData: () => {
        const localItemData = JSON.parse(localStorage.getItem(localStorageName) || '{}');
        if(Object.keys(localItemData)?.length > 0) {
            const data = localItemData;
            const dataSet = {
                id: toNumber(data?.id),
                supplierName: String(data?.supplierName).trim(),
                supplierContact: String(data?.supplierContact).trim(),
                supplierStatus: String(data?.supplierStatus).trim(),
                deliveryPrice: toNumber(data?.deliveryPrice),
                deliveryDate: String(data?.deliveryDate),
                productTypeName: String(data?.productTypeName).trim(),
                description: String(data?.description).trim(),
                itemCode: String(data?.itemCode).trim(),
                quantity: toNumber(data?.quantity),
                barcode: String(data?.barcode).trim(),
                srp: toNumber(data?.srp),
                maxDiscount: toNumber(data?.maxDiscount),
                unit: String(data?.unit).trim(),
                status: String(data?.status).trim(),
                image: String(data?.image).trim(),
                createdAt: String(data?.createdAt).trim(),
                updatedAt: String(data?.updatedAt).trim(),
            };
            set(dataSet);
        }
    }
}));