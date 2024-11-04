import { create } from 'zustand';
import { createFullname } from '@/utils/name';

export const zUser = create(set => ({
    firstname: '',
    lastname: '',
    username: '',
    fullname: '',

    save: (firstname, lastname, username) => {
        if(!firstname) {
            console.log('User store firstname is empty');
            return;
        } else if(!lastname) {
            console.log('User store lastname is empty');
            return;
        } else if(!username) {
            console.log('User store username is empty');
            return;
        }

        const fullName = createFullname(firstname, lastname);
        set(state => ({firstname, lastname, username, fullName}));
    }
}));