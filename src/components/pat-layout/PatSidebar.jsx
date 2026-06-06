import React, { useState, useRef, useEffect } from 'react';
import './PatSidebar.css';
import { editorStore } from '../../app/store/editorStore.js';
import cnf from '../sprites/Cat_not_found.png';
import { initAudio, playSound } from '../../audio/engine/toneEngine.js';
import { useDraggable } from '@dnd-kit/core';
import { db } from '../../db/db.js';


// Один перетаскиваемый звук кота в меню.
// Тело блока тащится (useDraggable), а кнопки play/star отдельно кликаются:
// им гасим pointerDown, чтобы нажатие не запускало перетаскивание.
function DraggableSound({ sound, catName, category, isPlaying, onPlay, isFav, onFav }) {
  // Подпись блока на дорожке. У барабанщика звуки длинные (kick, snare...),
  // поэтому для Drums пишем только имя звука без имени кота.
  // Для остальных категорий - ИмяКота-Нота (например Jony-C).
  const label = category === 'Drums' ? sound.name : `${catName}-${sound.name}`;

  // Затемнение оттенка по высоте ноты: C (id 1) самый яркий, каждая
  // следующая нота чуть темнее. Шаг 6% подмешивания чёрного на ноту.
  const noteDarken = (sound.id - 1) * 6;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sound-${catName}-${sound.id}`,
    data: {
      // Эти данные прилетят в onDragEnd при дропе на клетку
      type: 'sound',
      label,
      sound: sound.sound,
      category,
      // Затемнение тащим вместе со звуком, чтобы превью под курсором
      // и вставленный блок были точно того же оттенка, что и в меню
      noteDarken,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`cat-sound-item ${isDragging ? 'is-dragging' : ''}`}
      style={{ '--note-darken': noteDarken }}
      {...listeners}
      {...attributes}
    >
      <span>{sound.name}</span>
      <div className="cat-sound-btns">
        <button
          className="sound-btn" title="Прослушать"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onPlay}
        >{isPlaying ? '■' : '▶'}</button>
        {/* Звёздочка: по клику переключает жёлтый визуал избранного */}
        <button
          className={`sound-btn star-btn ${isFav ? 'is-favorite' : ''}`}
          title="В избранное"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onFav}
        >{isFav ? '★' : '☆'}</button>
      </div>
    </div>
  );
}

// Перетаскиваемый избранный звук
function DraggableFavorite({ fav, isPlaying, onPlay, onRemove }) {        // Делаем так, чтобы звуки из favorite были Draggable
  // Для барабанов подпись без имени кота, для остальных - ИмяКота-Нота
  const label = fav.catCategory === 'Drums'
    ? fav.soundName
    : `${fav.catName}-${fav.soundName}`;

  // Затемнение по высоте ноты - такое же, как в меню кота (id 1..5)
  const noteDarken = (fav.soundId - 1) * 6;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `fav-${fav.id}`,
    data: {
      type: 'sound',
      label,
      sound: fav.soundPath,
      category: fav.catCategory,
      noteDarken,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`favorite-item ${isDragging ? 'is-dragging' : ''}`}
      {...listeners}
      {...attributes}
    >
      <div className="favorite-info">
        <span className="favorite-cat-name">{fav.catName}</span>
        <span className="favorite-sound-name">{fav.soundName}</span>
      </div>
      <div className="favorite-btns">
        <button
          className="sound-btn" title="Прослушать"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onPlay}
        >{isPlaying ? '■' : '▶'}</button>
        <button
          className="sound-btn favorite-remove-btn" title="Удалить из избранного"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onRemove}
        >✕</button>
      </div>
    </div>
  );
}


export default function PatSidebar({ onBackToStudio }) {  
  const selectedCat = editorStore((state) => state.selectedCat);            // Выбранный кот из библиотеки
  const selectedSounds = editorStore((state) => state.selectedSounds);      // Его звуки
  const [playingId, setPlayingId] = useState(null);                         // ID играющего звука
  const playerRef = useRef(null);                                           // Ссылка на плеер
  const [favorites, setFavorites] = useState({});                           // Локальный визуал звёздочек (id -> true/false)
  const [favoriteList, setFavoriteList] = useState([]);                     // Список избранных звуков

  // Загружаем избранное при монтировании
  useEffect(() => {
    loadFavorites();
  }, []);

  // Останавливаем плеер при смене кота
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current.dispose();
      playerRef.current = null;
    }
    setPlayingId(null);
    loadFavorites();
}, [selectedCat]);

  const loadFavorites = async () => {                                    // Загрузка избранного из БД
    const favs = await db.favorites.toArray();
    setFavoriteList(favs);

    const favMap = {};
    favs.forEach(fav => {
      favMap[`${fav.catName}-${fav.soundId}`] = true;                   // Ключ = catName + soundId, чтобы звёздочки горели только для того кота чей звук в избранном
    });
    setFavorites(favMap);
  };

  const roleClass = selectedCat
    ? `cat-role-${selectedCat.category.toLowerCase()}`
    : 'cat-role-none';

  const toggleFavorite = async (sound) => {                               // Добавление/удаление из избранного
    const existing = await db.favorites
      .where('soundId').equals(sound.id)
      .and(fav => fav.catName === selectedCat.name)                     // Добавь проверку имени кота
      .first();

    if (existing){
      await db.favorites.delete(existing.id);
    } else {
      await db.favorites.add({
        soundId : sound.id,
        soundName: sound.name,
        soundPath : sound.sound,
        catName: selectedCat.name,
        catCategory: selectedCat.category
      });
    }

    await loadFavorites();
};

  const removeFromFavorites = async (id) => {                             // Удаление из избранного
    // Останавливаем плеер если удаляемый звук играет
    if (playingId === `fav-${id}`) {
      if (playerRef.current) {
        playerRef.current.stop();
        playerRef.current.dispose();
        playerRef.current = null;
      }
      setPlayingId(null);
    }
    await db.favorites.delete(id);
    await loadFavorites();
  };
  
  const handlePlayFavorite = async (soundPath, id) => {                   // Воспроизведение звука из избранного
    // Используем префикс fav- чтобы не было конфликтов с id звуков кота
    const favPlayingId = `fav-${id}`;
    
    await initAudio();

    if (playingId === favPlayingId){
      if (playerRef.current){
        playerRef.current.stop();
        playerRef.current.dispose();
        playerRef.current = null;
      }
      setPlayingId(null);
      return;
    }

    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current.dispose();
    }

    const player = playSound(soundPath);
    playerRef.current = player;
    setPlayingId(favPlayingId);

    player.onstop = () =>{
      setPlayingId(null);
      playerRef.current = null;
    };
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
            <DraggableSound
              key={sound.id}
              sound={sound}
              catName={selectedCat.name}
              category={selectedCat.category}
              isPlaying={playingId === sound.id}
              onPlay={() => handlePlaySound(sound)}
              isFav={!!favorites[`${selectedCat.name}-${sound.id}`]}
              onFav={() => toggleFavorite(sound)}
            />
        ))
      ) : (
          <span className="cat-hint">Выберите кота</span>
      )}

      </div>

      <div className="favorites-divider">Избранное</div>

      {/* Список избранных звуков */}
      <div className="favorites-box">
        {favoriteList.length > 0 ? (
          favoriteList.map((fav) => (
            <DraggableFavorite
              key={fav.id}
              fav={fav}
              isPlaying={playingId === `fav-${fav.id}`}
              onPlay={() => handlePlayFavorite(fav.soundPath, fav.id)}
              onRemove={() => removeFromFavorites(fav.id)}
            />
          ))
        ) : (
          <span className="favorites-empty-hint">Нажмите ☆ чтобы добавить звук</span>
        )}
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