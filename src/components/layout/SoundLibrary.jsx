import React, { useEffect, useState, useRef } from 'react';
import './SoundLibrary.css';
import {dbSL} from '../../db/db.js';
import cnf from '../sprites/Cat_not_found.png';

import ashleyImg from '../sprites/sound_cats/leads/leads_ashley_cat.png';
import chrisImg from '../sprites/sound_cats/leads/leads_chris_cat.png';
import lisaImg from '../sprites/sound_cats/leads/leads_lisa_cat.png';
import nastyaImg from '../sprites/sound_cats/leads/leads_nastya_cat.png';
import robImg from '../sprites/sound_cats/leads/leads_rob_cat.png';
import vovaImg from '../sprites/sound_cats/leads/leads_vova_cat.png';
import basyaImg from '../sprites/sound_cats/bass/bass_basya_cat.png';
import katieImg from '../sprites/sound_cats/bass/bass_katie_cat.png';
import jimieImg from '../sprites/sound_cats/bass/bass_jimie_cat.png';
import jonyImg from '../sprites/sound_cats/pads/pad_jony_cat.png';
import padaImg from '../sprites/sound_cats/pads/pad_pada_cat.png';
import peterImg from '../sprites/sound_cats/pads/pad_peter_cat.png';
import antonImg from '../sprites/sound_cats/drums/drums_anton.png';

const categories = ['Lead', 'Bass', 'Pad', 'Drums'];

export default function SoundLibrary() {
    const [cats, setCats] = useState([]);
    const loaded = useRef(false);                                   // Флаг загрузки для предотвращения дублирования добавления котов

    useEffect(() => {               
        async function loadCats() { 
            await dbSL.cats.clear();
            const cnt = await dbSL.cats.count();
            if (loaded.current) return;
            loaded.current = true;
            
            await dbSL.cats.bulkAdd([
                { name: 'Ashley', category: 'Lead', png_path: ashleyImg, sound_path: 'sounds/lead1' },
                { name: 'Chris',  category: 'Lead', png_path: chrisImg, sound_path: 'sounds/lead2' },
                { name: 'Lisa',   category: 'Lead', png_path: lisaImg, sound_path: 'sounds/lead1' },
                { name: 'Nastya', category: 'Lead', png_path: nastyaImg, sound_path: 'sounds/lead2' },
                { name: 'Rob',    category: 'Lead', png_path: robImg, sound_path: 'sounds/lead1' },
                { name: 'Vova',   category: 'Lead', png_path: vovaImg, sound_path: 'sounds/lead2' },
                { name: 'Basya',  category: 'Bass', png_path: basyaImg, sound_path: 'sounds/bass1' },
                { name: 'Katie',  category: 'Bass', png_path: katieImg, sound_path: 'sounds/bass2' },
                { name: 'Jimie',  category: 'Bass', png_path: jimieImg, sound_path: 'sounds/bass2' },
                { name: 'Jony',   category: 'Pad',  png_path: jonyImg, sound_path: 'sounds/pad1' },
                { name: 'Pada',   category: 'Pad',  png_path: padaImg, sound_path: 'sounds/pad2' },
                { name: 'Peter',  category: 'Pad',  png_path: peterImg, sound_path: 'sounds/pad2' },
                { name: 'Anton',  category: 'Drums', png_path: antonImg, sound_path: 'sounds/drum2' },
            ]);

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