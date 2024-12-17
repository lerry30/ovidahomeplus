import { zUser } from '@/store/user';
import { deleteFromIDb } from '@/utils/iDb';
import * as localStorageNames from '@/constants/localStorageNames';

export const signout = async () => {
    zUser.getState().wipeOutData();
    
    indexedDB.deleteDatabase('ovidaIDb');

    // const response = await fetch('/api/users/signout', { method: 'POST' });
    // return !!response?.success;
}
