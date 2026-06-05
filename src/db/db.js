import Dexie from 'dexie';

export const db = new Dexie('MewsikStudio');
export const dbSL = new Dexie('SoundLibrary')

db.version(1).stores({
    projects: '++id, name, updatedAt',
});

dbSL.version(1).stores({
    cats: '++id, name, category, png_path, sounds'
});

db.version(2).stores({
    projects: '++id, name, updatedAt',
    favorites: '++id, soundId, soundName, catName, soundPath, catCategory'
});

await dbSL.cats.clear();