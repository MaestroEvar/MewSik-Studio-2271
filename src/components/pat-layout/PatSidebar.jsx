import React, { useState, useRef, useEffect } from 'react';
import './PatSidebar.css';
import { editorStore } from '../../app/store/editorStore.js';
import cnf from '../sprites/Cat_not_found.png';
import { initAudio, playSound } from '../../audio/engine/toneEngine.js';


export default function PatSidebar({ onBackToStudio }) {  
  const selectedCat = editorStore((state) => state.selectedCat);            // Выбранный кот из библиотеки
  const selectedSounds = editorStore((state) => state.selectedSounds);      // Его звуки
  const [playingId, setPlayingId] = useState(null);                         // ID играющего звука
  const playerRef = useRef(null);                                           // Ссылка на плеер
  const [favorites, setFavorites] = useState({});                          // Локальный визуал звёздочек (id -> true/false)

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current.dispose();
      playerRef.current = null;
    }
    setPlayingId(null);
  }, [selectedCat]);

  // Класс роли для всей панели. Меняется в зависимости от категории кота.
  // Если кот не выбран - нейтральный класс без цвета роли.
  const roleClass = selectedCat
    ? `cat-role-${selectedCat.category.toLowerCase()}`
    : 'cat-role-none';

  // Переключение визуала звёздочки (только цвет, никакой логики избранного)
  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePlaySound = async (sound) => {                                // Воспроизведение звуков
    await initAudio();

    if (playingId === sound.id) {                                           // Если уже играет - остановить
      if (playerRef.current) {
        playerRef.current.stop();
        playerRef.current.dispose();
        playerRef.current = null;
      }
      setPlayingId(null);
      return;
    }

    if (playerRef.current) {                                                // Остановить предыдущий
      playerRef.current.stop();
      playerRef.current.dispose();
    }

    const player = playSound(sound.sound);                                  // Запустить новый
    playerRef.current = player;
    setPlayingId(sound.id);

    player.onstop = () => {                                                 // Когда звук остановится, вернуть play
      setPlayingId(null);
      playerRef.current = null;
    };
};

  return (
    // Класс роли красит панель в цвет категории кота через CSS-переменную
    <aside className={`pat-sounds-sidebar ${roleClass}`}>

      {/* Заголовок колонки */}
      <div className="sidebar-title">Tracks & Sounds</div>

      {/* Меню кота */}
      {/* Рамка: картинка выбранного кота + список его звуков */}
      <div className="cat-menu-box">

      {/* Бейдж категории кота - подсвечивает текущую роль */}
      {selectedCat && (
        <div className="cat-role-badge">{selectedCat.category}</div>
      )}

      <div className="cat-image-placeholder">
        {selectedCat ? (
            <img
                src={selectedCat.png_path}
                alt={selectedCat.name}
                className="selected-cat-img"
                onError={(e) => { e.target.src = cnf; }}
            />
        ) : (
            <span>🐱 Кот не выбран</span>
        )}
      </div>

      {selectedCat && (
        <div className="cat-name">{selectedCat.name}</div>
      )}

      {selectedSounds && selectedSounds.length > 0 ? (
        selectedSounds.map((sound) => (
            <div key={sound.id} className="cat-sound-item">
                <span>{sound.name}</span>
                <div className="cat-sound-btns">
                  <button 
                    className="sound-btn" title="Прослушать"
                    onClick={() => handlePlaySound(sound)}
                  >{playingId === sound.id ? '■' : '▶'}</button>
                  {/* Звёздочка: по клику переключает жёлтый визуал избранного */}
                  <button
                    className={`sound-btn star-btn ${favorites[sound.id] ? 'is-favorite' : ''}`}
                    title="В избранное"
                    onClick={() => toggleFavorite(sound.id)}
                  >{favorites[sound.id] ? '★' : '☆'}</button>
                </div>
            </div>
        ))
      ) : (
          <span className="cat-hint">Выберите кота</span>
      )}

      </div>

      <div className="favorites-divider">Избранное</div>

      {/* Список избранных звуков */}
      {/* Пока пустая рамка - наполним когда добавим логику звёздочки */}
      <div className="favorites-box">
        <span className="favorites-empty-hint">
          Нажмите ☆ чтобы добавить звук
        </span>
      </div>

      {/* Кнопки снизу */}
      <div className="sidebar-buttons-container">
        <button className="sidebar-btn btn-add-sound">
          + Add sound
        </button>
        <button className="sidebar-btn btn-back-main" onClick={onBackToStudio}>
          ← Back to Studio
        </button>
      </div>

    </aside>
  );
}
