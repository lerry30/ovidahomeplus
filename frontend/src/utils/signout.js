import { zUser } from '@/store/user';
import * as localStorageNames from '@/constants/localStorageNames';

export const signout = async () => {
    zUser.getState().wipeOutData();
    
    for(const key in localStorageNames) {
        const storageName = localStorageNames[key];
        //localStorage.removeItem(storageName);
    }

    // const response = await fetch('/api/users/signout', { method: 'POST' });
    // return !!response?.success;
}
