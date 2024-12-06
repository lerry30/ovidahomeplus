import { create } from 'zustand';
import { toNumber } from '@/utils/number';
import { expense as localStorageName } from '@/constants/localStorageNames';

export const zExpense = create(set => ({
    id: '',
    type: '',
    amount: 0,

    saveExpenseData: (id, type, amount) => {
        if(!id || !type || amount <= 0) {
            console.log('Store Error: Expense id, type is empty or amount is zero.');
            return;
        }

        const dataSet = {
            id: toNumber(id) ?? 0,
            type: String(type).trim(),
            amount: toNumber(amount) ?? 0
        }
        localStorage.setItem(localStorageName, JSON.stringify(dataSet));
        set(dataSet);
    },

    reloadExpenseData: () => {
        const localExpenseData = JSON.parse(localStorage.getItem(localStorageName) || '{}');
        if(Object.values(localExpenseData).length > 0) {
            const id = toNumber(localExpenseData?.id) ?? 0;
            const type = String(localExpenseData?.type).trim();
            const amount = toNumber(localExpenseData?.amount) ?? 0;

            set({type, amount});
        }
    }
}));