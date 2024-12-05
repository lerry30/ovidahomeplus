import { create } from 'zustand';
import { customerInfo as localStorageName } from '@/constants/localStorageNames';

export const zCustomerInfo = create(set => ({
    firstname: '',
    lastname: '',
    address: '',
    contacts: {
        first: '',
        second: ''
    },

    saveCustomerData: (firstname, lastname, address, contacts) => {
        if(!firstname || !lastname || !address || !contacts?.first) {
            console.log('Customer information contains empty data.');
            return;
        }

        const dataSet = {
            firstname: String(firstname).trim(), 
            lastname: String(lastname).trim(), 
            address: String(address).trim(), 
            contacts: contacts
        };
        localStorage.setItem(localStorageName, JSON.stringify(dataSet));
        set({firstname, lastname, address, contacts});
    },

    reloadCustomerData: () => {
        const {firstname, lastname, address, contacts} = JSON.parse(localStorage.getItem(localStorageName) || '{}');
        if(firstname && lastname && address && contacts?.first) {
            set({firstname, lastname, address, contacts});
        }
    }
}));