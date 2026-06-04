import React, { useEffect, useState, useRef } from 'react';
import './SoundLibrary.css';
import {dbSL} from '../../db/db.js';
import cnf from '../sprites/Cat_not_found.png';
import { editorStore } from '../../app/store/editorStore.js';

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
    const setSelectedCat = editorStore((state) => state.setSelectedCat); // Для загрузки котов из библиотеки в PatRedactor

    useEffect(() => {               
        async function loadCats() { 
            if (loaded.current) return;
            loaded.current = true;
            const cnt = await dbSL.cats.count();
            
            await dbSL.cats.bulkAdd([
                { name: 'Ashley', category: 'Lead', png_path: ashleyImg, sounds: [
                    '/audio_files/leads/ashley(lead)/C.wav',
                    '/audio_files/leads/ashley(lead)/D.wav',
                    '/audio_files/leads/ashley(lead)/E.wav',
                    '/audio_files/leads/ashley(lead)/F.wav',
                    '/audio_files/leads/ashley(lead)/G.wav',
                ]},
                { name: 'Chris', category: 'Lead', png_path: chrisImg, sounds: [
                    '/audio_files/leads/chris(lead)/C.wav',
                    '/audio_files/leads/chris(lead)/D.wav',
                    '/audio_files/leads/chris(lead)/E.wav',
                    '/audio_files/leads/chris(lead)/F.wav',
                    '/audio_files/leads/chris(lead)/G.wav',
                ]},
                { name: 'Lisa', category: 'Lead', png_path: lisaImg, sounds: [
                    '/audio_files/leads/lisa(lead)/C.wav',
                    '/audio_files/leads/lisa(lead)/D.wav',
                    '/audio_files/leads/lisa(lead)/E.wav',
                    '/audio_files/leads/lisa(lead)/F.wav',
                    '/audio_files/leads/lisa(lead)/G.wav',
                ]},
                { name: 'Nastya', category: 'Lead', png_path: nastyaImg, sounds: [
                    '/audio_files/leads/nastya(lead)/C.wav',
                    '/audio_files/leads/nastya(lead)/D.wav',
                    '/audio_files/leads/nastya(lead)/E.wav',
                    '/audio_files/leads/nastya(lead)/F.wav',
                    '/audio_files/leads/nastya(lead)/G.wav',
                ]},
                { name: 'Rob', category: 'Lead', png_path: robImg, sounds: [
                    '/audio_files/leads/Rob(lead)/C.wav',
                    '/audio_files/leads/Rob(lead)/D.wav',
                    '/audio_files/leads/Rob(lead)/E.wav',
                    '/audio_files/leads/Rob(lead)/F.wav',
                    '/audio_files/leads/Rob(lead)/G.wav',
                ]},
                { name: 'Vova', category: 'Lead', png_path: vovaImg, sounds: [
                    '/audio_files/leads/vova(lead)/C.wav',
                    '/audio_files/leads/vova(lead)/D.wav',
                    '/audio_files/leads/vova(lead)/E.wav',
                    '/audio_files/leads/vova(lead)/F.wav',
                    '/audio_files/leads/vova(lead)/G.wav',
                ]},
                { name: 'Basya', category: 'Bass', png_path: basyaImg, sounds: [
                    '/audio_files/bass/basya(bass)/C.wav',
                    '/audio_files/bass/basya(bass)/D.wav',
                    '/audio_files/bass/basya(bass)/E.wav',
                    '/audio_files/bass/basya(bass)/F.wav',
                    '/audio_files/bass/basya(bass)/G.wav',
                ]},
                { name: 'Katie', category: 'Bass', png_path: katieImg, sounds: [
                    '/audio_files/bass/katie(bass)/C.wav',
                    '/audio_files/bass/katie(bass)/D.wav',
                    '/audio_files/bass/katie(bass)/E.wav',
                    '/audio_files/bass/katie(bass)/F.wav',
                    '/audio_files/bass/katie(bass)/G.wav',
                ]},
                { name: 'Jimie', category: 'Bass', png_path: jimieImg, sounds: [
                    '/audio_files/bass/jimie(bass)/C.wav',
                    '/audio_files/bass/jimie(bass)/D.wav',
                    '/audio_files/bass/jimie(bass)/E.wav',
                    '/audio_files/bass/jimie(bass)/F.wav',
                    '/audio_files/bass/jimie(bass)/G.wav',
                ]},
                { name: 'Jony', category: 'Pad', png_path: jonyImg, sounds: [
                    '/audio_files/pads/jony(pad)/C.wav',
                    '/audio_files/pads/jony(pad)/D.wav',
                    '/audio_files/pads/jony(pad)/E.wav',
                    '/audio_files/pads/jony(pad)/F.wav',
                    '/audio_files/pads/jony(pad)/G.wav',
                ]},
                { name: 'Pada', category: 'Pad', png_path: padaImg, sounds: [
                    '/audio_files/pads/Pada(pad)/C.wav',
                    '/audio_files/pads/Pada(pad)/D.wav',
                    '/audio_files/pads/Pada(pad)/E.wav',
                    '/audio_files/pads/Pada(pad)/F.wav',
                    '/audio_files/pads/Pada(pad)/G.wav',
                ]},
                { name: 'Peter', category: 'Pad', png_path: peterImg, sounds: [
                    '/audio_files/pads/peter(pad)/C.wav',
                    '/audio_files/pads/peter(pad)/D.wav',
                    '/audio_files/pads/peter(pad)/E.wav',
                    '/audio_files/pads/peter(pad)/F.wav',
                    '/audio_files/pads/peter(pad)/G.wav',
                ]},
                { name: 'Anton', category: 'Drums', png_path: antonImg, sounds: [
                    '/audio_files/drums/anton(drums)/kick.wav',
                    '/audio_files/drums/anton(drums)/snare.wav',
                    '/audio_files/drums/anton(drums)/crash.wav',
                    '/audio_files/drums/anton(drums)/c_hat.wav',
                    '/audio_files/drums/anton(drums)/o_hat.wav',
                ]},
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
                                <a href="" key={cat.id} onClick={(e) => {
                                        e.preventDefault();
                                        setSelectedCat(cat);
                                    }} className='card'>
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