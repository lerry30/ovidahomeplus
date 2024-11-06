import { create } from 'zustand';
import { createFullname } from '@/utils/name';
import { user as localStorageName } from '@/constants/localStorageNames';
import { urls } from '@/constants/urls';
import { getData } from '@/utils/send';

export const zUser = create(set => ({
    firstname: '',
    lastname: '',
    username: '',
    fullname: '',
    image: '',

    saveUserData: async () => {
        const isLocalUserDataExist = (Object.keys(JSON.parse(localStorage.getItem(localStorageName) || '{}')).length > 0);
        if(!isLocalUserDataExist) {
            const response = await getData(urls.user);
            localStorage.setItem(localStorageName, JSON.stringify(response));
        }
        
        const { firstname, lastname, username, image } = JSON.parse(localStorage.getItem(localStorageName) || '{}');

        set(state => {
            const fullname = createFullname(firstname, lastname);
            return { firstname, lastname, username, fullname, image };
        });
    },
}));