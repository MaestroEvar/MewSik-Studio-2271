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

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current.dispose();
      playerRef.current = null;
    }
    setPlayingId(null);
  }, [selectedCat]);

  const handlePlaySound = async (sound) => {                                // Воспроизведение звуков
    await initAudio();

    if (playingId === sound.id) {                                           // Если уже играет — остановить
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
    <aside className="pat-sounds-sidebar">

      {/* Заголовок колонки */}
      <div className="sidebar-title">Tracks & Sounds</div>

      {/* ===== МЕНЮ КОТА ===== */}
      {/* Рамка: картинка выбранного кота + список его звуков */}
      <div className="cat-menu-box">

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
                  <button className="sound-btn" title="В избранное">☆</button>
                </div>
            </div>
        ))
      ) : (
          <span>Выберите кота</span>
      )}

      </div>

      <div className="favorites-divider">Избранное</div>

      {/* ===== СПИСОК ИЗБРАННЫХ ЗВУКОВ ===== */}
      {/* Пока пустая рамка - наполним когда добавим логику звёздочки */}
      <div className="favorites-box">
        <span className="favorites-empty-hint">
          Нажмите ☆ чтобы добавить звук
        </span>
      </div>

      {/* ===== КНОПКИ ВНИЗУ ===== */}
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
