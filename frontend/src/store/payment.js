import { create } from 'zustand';
import { payment as localStorageName } from '@/constants/localStorageNames';

export const zPayment = create(set => ({
    method: 'Cash Payment',
    denominations: {},
    totalPayment: 0,
    change: 0,

    savePaymentData: (payment) => {
        const method = payment?.method;
        const methods = ['Cash Payment', 'E-Wallet', 'Credit/Debit Card', 'Bank Transfer'];
        if(!methods.includes(method)) {
            console.log('Undefined payment method');
            return;
        }

        const data = {};
        if(method === 'Cash Payment') {
            const {denominations, totalPayment, change} = payment.cashData;
            if(Object.values(denominations).length===0 || totalPayment<=0 || change<0) {
                console.log('Can\'t save, ensure the full amount is disclosed.');
                return;
            }
            data.cash = {denominations, totalPayment, change}
        }

        localStorage.setItem(localStorageName, JSON.stringify({paymentMethod: method, ...data}));
        set(data);
    },

    reloadPaymentData: () => {
        const paymentData = JSON.parse(localStorage.getItem(localStorageName) || '{}');
        if(Object.values(paymentData).length===0) {
            console.log('Payment data is empty.');
            return;
        }
        set(paymentData);
    },

    wipeOutData: () => {
        set({
            method: '',
            denominations: {},
            totalPayment: 0,
            change: 0
        });
    }
}));
