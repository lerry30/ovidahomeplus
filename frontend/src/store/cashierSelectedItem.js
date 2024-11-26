import { create } from 'zustand';
import { selectedItemsForCashier as localStorageName } from '@/constants/localStorageNames';

export const zCashierSelectedItem = create(set => ({
    items: {}, // -> each item {id: {quantity: 0, isDiscounted: 0}}

    saveSelectedItemData: (items) => {
        localStorage.setItem(localStorageName, JSON.stringify(items));
        set({items});
    },

    reloadSelectedItemData: () => {
        const localSelectedData = JSON.parse(localStorage.getItem(localStorageName) || '{}');
        if(Object.keys(localSelectedData)?.length > 0) {
            const items = localSelectedData;
            set({items});
        }
    },
}));