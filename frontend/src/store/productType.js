import { create } from 'zustand';
import { productType as localStorageName } from '@/constants/localStorageNames';

export const zProductType = create(set => ({
    id: 0,
    name: '',
    image: '',
    status: '',

    saveProductTypeData: (id, name, image, status) => {
        localStorage.setItem(localStorageName, JSON.stringify({id, name, image, status}));
        set({id, name, image, status});
    },

    reloadProductTypeData: () => {
        const localProductTypeData = JSON.parse(localStorage.getItem(localStorageName) || '{}');
        if(Object.keys(localProductTypeData)?.length > 0) {
            const {id, name, image, status} = localProductTypeData;
            set({id, name, image, status});
        }
    },

    wipeOutData: () => {
        set({
            id: 0,
            name: '',
            image: '',
            status: ''
        });
    }
}));
