import Dexie from 'dexie';

export const db = new Dexie('MewsikStudio');
export const dbSL = new Dexie('SoundLibrary')

db.version(1).stores({
    projects: '++id, name, updatedAt',
});

dbSL.version(1).stores({
    cats: '++id, name, png_path, sound_path'
});