import { openDB } from 'idb';
import * as localStorageNames from '@/constants/localStorageNames';

const dbName = 'ovidaIDb';
const dbVersion = 1;
const defaultKey = 'item';
const DB_INITIALIZED_KEY = 'db_initialized_v1';

const createObjectStores = (db) => {
    const tasks = Object.keys(localStorageNames).map((key) => {
        const name = localStorageNames[key];
        if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, { keyPath: 'id' });
        }
    });
    return Promise.all(tasks);
};

export const initializeDb = async () => {
    //const isInitialized = localStorage.getItem(DB_INITIALIZED_KEY);
    //if (isInitialized) return;
    try {
        await openDB(dbName, dbVersion, {
            upgrade(db) {
                createObjectStores(db);
            },
        });
        localStorage.setItem(DB_INITIALIZED_KEY, true);
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
};

export const saveToIDb = async (storageName, item) => {
    try {
        const db = await openDB(dbName, dbVersion);
        // Generate a unique ID if not provided
        const itemToSave = { 
            data: item,
            id: defaultKey,
            timestamp: Date.now()
        };
        
        return await db.put(storageName, itemToSave);
    } catch (error) {
        console.error(`Failed to save to ${storageName}:`, error);
        throw error;
    }
};

export const getToIDb = async (storageName) => {
    try {
        const db = await openDB(dbName, dbVersion);
        return (await db.get(storageName, defaultKey) || {}).data;
    } catch (error) {
        console.error(`Failed to get from ${storageName}:`, error);
        return null;
    }
};

export const getAllFromIDb = async (storageName) => {
    try {
        const db = await openDB(dbName, dbVersion);
        return (await db.getAll(storageName) || {}).data;
    } catch (error) {
        console.error(`Failed to get all from ${storageName}:`, error);
        return [];
    }
};

export const deleteFromIDb = async (storageName) => {
    try {
        const db = await openDB(dbName, dbVersion);
        await db.delete(storageName, defaultKey);
    } catch (error) {
        console.error(`Failed to delete from ${storageName}:`, error);
        throw error;
    }
};

// Clear entire object store
export const clearIDbStore = async (storageName) => {
    try {
        const db = await openDB(dbName, dbVersion);
        await db.clear(storageName);
    } catch (error) {
        console.error(`Failed to clear ${storageName}:`, error);
        throw error;
    }
};
