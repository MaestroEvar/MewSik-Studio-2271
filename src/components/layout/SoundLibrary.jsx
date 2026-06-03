import React, { useEffect, useState } from 'react';
import './SoundLibrary.css';
import {dbSL} from '../../db/db.js';
import bossImg from '../sprites/boss.png';

const categories = ['Lead', 'Bass', 'Pad', 'Drums'];

export default function SoundLibrary() {
    const [cats, setCats] = useState([]);   

    useEffect(() => {               
        async function loadCats() {
            const cnt = dbSL.cats.count();      

            if (cnt === 0){                                         // Считаем количество котов в БД, если = 0, то заполняем
                await dbSL.cats.bulkAdd([
                    { name: 'Cat Lead 1', category: 'Lead', png_path: 'cat.jpg', sound_path: 'sounds/lead1' },
                    { name: 'Cat Lead 2', category: 'Lead', png_path: 'cat.jpg', sound_path: 'sounds/lead2' },
                    { name: 'Cat Bass 1', category: 'Bass', png_path: 'cat.jpg', sound_path: 'sounds/bass1' },
                    { name: 'Cat Bass 2', category: 'Bass', png_path: 'cat.jpg', sound_path: 'sounds/bass2' },
                    { name: 'Cat Pad 1',  category: 'Pad',  png_path: 'cat.jpg', sound_path: 'sounds/pad1' },
                    { name: 'Cat Pad 2',  category: 'Pad',  png_path: 'cat.jpg', sound_path: 'sounds/pad2' },
                    { name: 'Cat Drum 1', category: 'Drums', png_path: 'cat.jpg', sound_path: 'sounds/drum1' },
                    { name: 'Cat Drum 2', category: 'Drums', png_path: 'cat.jpg', sound_path: 'sounds/drum2' },
                ]);
            }

            const allCats = await dbSL.cats.toArray();                // Загружаем котов из БД
            setCats(allCats);
        }
        loadCats();
    }, []);

    return (
        <div className='sound_library'>
            {categories.map(category => {
                const categoryCats = cats.filter(cat => cat.category === category);
                
                return (
                    <div className='category_section' key={category}>
                        <h3 className='category_title'>{category}</h3>

                        <div className='container'>
                            {categoryCats.map(cat => (
                                <a href="" key={cat.id} onClick={(e) => e.preventDefault()} className='card'>
                                    <img 
                                        src={cat.png_path} 
                                        alt={cat.name}
                                        onError={(e) => {
                                            e.target.src = bossImg;
                                            e.target.alt = "Кота нет.";
                                        }}
                                    />
                                    <p>{cat.name}</p>
                                </a>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};