

export const newInactive = 'INSERT INTO disabled_items(item_id, note) VALUES(?, ?);';
export const removeInactive = 'DELETE FROM disabled_items WHERE item_id=?;';