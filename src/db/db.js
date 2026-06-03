import Dexie from 'dexie';

export const db = new Dexie('MewsikStudio');

db.version(1).stores({
    projects: '++id, name, updatedAt',
});

export default db;