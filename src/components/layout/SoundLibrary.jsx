import React, { useEffect, useState } from 'react';
import './SoundLibrary.css';
import db from '../../db/db.js';
import dbSL from '../../db/db.js';

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
            <h1>sound library</h1>

            <div className='conatiner'>
                {cats.map(cat => (
                    <a
                        key={cat.id}
                        href=""
                        onClick={}
                        className='card'
                    >

                        <img
                            src={cat.png_path}
                            alt={cat.name}
                            onError={(e) => {
                                e.target.src = 'cat.jpg';
                                e.target.alt = 'Кота нет.';
                            }}
                        />

                        <p>{cat.name}</p>
                    </a>
                ))}
            </div>
        </div>
    );
}