import { zUser } from '@/store/user';
import * as localStorageNames from '@/constants/localStorageNames';

export const signout = () => {
    zUser.getState().wipeOutData();
    
    for(const key in localStorageNames) {
        const name = localStorageNames[key];
        localStorage.removeItem(name);
    }

    // const response = await fetch('/api/users/signout', { method: 'POST' });
    // return !!response?.success;
}