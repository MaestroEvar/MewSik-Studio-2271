    import React, { useEffect, useState } from 'react';
    import './SoundLibrary.css';
    import {dbSL} from '../../db/db.js';
    import bossImg from '../sprites/boss.png';

    export default function SoundLibrary() {
        const [cats, setCats] = useState([]);   

        useEffect(() => {               
            async function loadCats() {
                const allCats = await dbSL.cats.toArray();                // Загружаем котов из БД
                setCats(allCats);
            }
            loadCats();
        }, []);

        return (
            <div className='sound_library'>
                <div className='container'>
                    {cats.map(cat => (
                        <a key={cat.id} href="" onClick={(e) => e.preventDefault()} className='card'>
                            <img src={cat.png_path} alt={cat.name} onError={(e) => {
                                e.target.src = bossImg;
                                e.target.alt = 'Кота нет.';
                            }} />
                            <p>{cat.name}</p>
                        </a>
                    ))}
                </div>
            </div>
        );
    }