import React, { useEffect, useState } from 'react';
import './SoundLibrary.css';
import {dbSL} from '../../db/db.js';
import cnf from '../sprites/Cat_not_found.png';

const categories = ['Lead', 'Bass', 'Pad', 'Drums'];

export default function SoundLibrary() {
    const [cats, setCats] = useState([]);   

    useEffect(() => {               
        async function loadCats() {
            const cnt = dbSL.cats.count();      

            if (cnt === 0){                                         // Считаем количество котов в БД, если = 0, то заполняем
                await dbSL.cats.bulkAdd([
                    { name: 'Ashley', category: 'Lead', png_path: '../sprites/sound_cats/leads/leads_ashley_cat.png', sound_path: 'sounds/lead1' },
                    { name: 'Chris', category: 'Lead', png_path: '../sprites/sound_cats/leads/leads_chris_cat.png', sound_path: 'sounds/lead2' },
                    { name: 'Lisa', category: 'Lead', png_path: '../sprites/sound_cats/leads/leads_lisa_cat.png', sound_path: 'sounds/lead1' },
                    { name: 'Nastya', category: 'Lead', png_path: '../sprites/sound_cats/leads/leads_nastya_cat.png', sound_path: 'sounds/lead2' },
                    { name: 'Rob', category: 'Lead', png_path: '../sprites/sound_cats/leads/leads_rob_cat.png', sound_path: 'sounds/lead1' },
                    { name: 'Vova', category: 'Lead', png_path: '../sprites/sound_cats/leads/leads_vova_cat.png', sound_path: 'sounds/lead2' },
                    { name: 'Basya', category: 'Bass', png_path: '../sprites/sound_cats/bass/bass_basya_cat.png', sound_path: 'sounds/bass1' },
                    { name: 'Katie', category: 'Bass', png_path: '../sprites/sound_cats/bass/bass_katie_cat.png', sound_path: 'sounds/bass2' },
                    { name: 'Jimie', category: 'Bass', png_path: '../sprites/sound_cats/bass/bass_jimie_cat.png', sound_path: 'sounds/bass2' },
                    { name: 'Jony',  category: 'Pad',  png_path: '../sprites/sound_cats/pads/pad_jony_cat.png', sound_path: 'sounds/pad1' },
                    { name: 'Pada',  category: 'Pad',  png_path: '../sprites/sound_cats/bass/bass_pada_cat.png', sound_path: 'sounds/pad2' },
                    { name: 'Peter',  category: 'Pad',  png_path: '../sprites/sound_cats/bass/bass_Peter_cat.png', sound_path: 'sounds/pad2' },
                    { name: 'Anton', category: 'Drums', png_path: '../sprites/sound_cats/drums/drums_anton.png', sound_path: 'sounds/drum2' },
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
                                            e.target.src = cnf;
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