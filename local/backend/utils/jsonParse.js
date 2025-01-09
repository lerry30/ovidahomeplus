// it helps to parse nested objects with json objects 
export const parseOneDeep = (array, keys=[]) => {
    const items = [];
    for(const item of array) {
        const children = {};
        for(const key of keys) {
            if(item[key]) {
                const nChild = item[key] ?? [];
                const fChild = typeof nChild==='string' ? JSON.parse(nChild) : nChild;
                children[key] = fChild;
            }
        }
        items.push({...item, ...children});
    }
    return items;
}
