import { create } from 'zustand';
import { supplier as localStorageName } from '@/constants/localStorageNames';

export const zSupplier = create(set => ({
    id: 0,
    name: '',
    contact: '',
    image: '',
    status: '',

    saveSupplierData: (id, name, contact, image, status) => {
        localStorage.setItem(localStorageName, JSON.stringify({id, name, contact, image, status}));
        set({id, name, contact, image, status});
    },

    reloadSupplierData: () => {
        const localSupplierData = JSON.parse(localStorage.getItem(localStorageName) || '{}');
        if(Object.keys(localSupplierData)?.length > 0) {
            const {id, name, contact, image, status} = localSupplierData;
            set({id, name, contact, image, status});
        }
    }
}));