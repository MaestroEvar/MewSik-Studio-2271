import React, { useState, useRef, useEffect } from 'react';
import './PatSidebar.css';
import { editorStore } from '../../app/store/editorStore.js';
import cnf from '../sprites/Cat_not_found.png';
import { initAudio, playSound } from '../../audio/engine/toneEngine.js';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { db } from '../../db/db.js';

// Сколько держать без движения, чтобы звук выбрался (мс)
const LONG_PRESS_MS = 1000;
// Порог в пикселях: если за время удержания курсор сдвинулся дальше -
// значит человек тащит блок (drag), а не выбирает. Тогда таймер отменяется.
const PRESS_MOVE_THRESHOLD = 6;

// Хук "выбор по долгому зажатию".
// Возвращает обработчики для тела звука и сам признак, нужно ли подключать drag.
//   - Зажал и держишь 1 сек без движения -> onSelect (звук выбирается).
//   - Сдвинул дальше порога за это время -> отмена, начинается обычный drag.
//   - Короткий клик по уже выбранному -> onUnselect (снять выбор).
//   - Короткий клик по невыбранному -> ничего.
// isSelected важен: у выбранного звука drag отключаем совсем.
function useLongPressSelect({ isSelected, onSelect, onUnselect }) {
  const timerRef = useRef(null);
  const startRef = useRef(null);
  const firedRef = useRef(false);   // сработал ли долгий выбор в этом нажатии
  const movedRef = useRef(false);   // ушёл ли курсор дальше порога

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    startRef.current = { x: e.clientX, y: e.clientY };
    firedRef.current = false;
    movedRef.current = false;

    // Выбранный звук не перетаскивается - для него таймер не нужен,
    // нажатие обрабатываем как обычный клик (снятие выбора) на pointerUp.
    if (isSelected) return;

    clearTimer();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (!movedRef.current) {
        firedRef.current = true; // Если держали курсор ровно - выбираем звук
        onSelect();
      }
    }, LONG_PRESS_MS);
  };

  const onPointerMove = (e) => {
    const start = startRef.current;
    if (!start) return;
    const dx = Math.abs(e.clientX - start.x);
    const dy = Math.abs(e.clientY - start.y);
    if (dx > PRESS_MOVE_THRESHOLD || dy > PRESS_MOVE_THRESHOLD) {
      movedRef.current = true;
      clearTimer();
    }
  };

  const onPointerUp = (e) => {
    clearTimer();
    const start = startRef.current;
    startRef.current = null;
    if (!start || e.button !== 0) return;

    // Короткий клик
    const dx = Math.abs(e.clientX - start.x);
    const dy = Math.abs(e.clientY - start.y);
    const isClick = !firedRef.current && dx <= PRESS_MOVE_THRESHOLD && dy <= PRESS_MOVE_THRESHOLD;

    if (isClick && isSelected) {
      onUnselect();// Клик по выбранному - снимаем выбор
    }
    // клик по невыбранному - ничего не делаем
  };

  // Чистим таймер, если компонент пропал во время удержания
  useEffect(() => () => clearTimer(), []);

  return { onPointerDown, onPointerMove, onPointerUp };
}


{/* Один перетаскиваемый звук кота в меню.
 Тело блока тащится (useDraggable), а кнопки play/star отдельно кликаются:
 им гасим pointerDown, чтобы нажатие не запускало перетаскивание.*/}
 function DraggableSound({ sound, catName, category, isPlaying, onPlay, isFav, onFav, isSelected, onSelect, onUnselect }) {
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
      type: 'sound',
      label,
      sound: sound.sound,
      category,
      noteDarken,
      soundId: sound.id,
    },
  });

  const roleColors = {
    Lead: '#a78bfa',
    Bass: '#f472b6',
    Pad: '#34d399',
    Drums: '#fbbf24',
  };
  const roleColor = roleColors[category] || '#6f747c';

  // Логика выбора по долгому зажатию (1 сек без движения)
  const longPress = useLongPressSelect({ isSelected, onSelect, onUnselect });

  // У выбранного звука перетаскивание отключаем: не расставляем drag-слушатели
  // и убираем курсор-"руку" (класс is-selected задаёт cursor: default в CSS).
  const dragProps = isSelected ? {} : { ...listeners, ...attributes };

  return (
    <div
      ref={setNodeRef}
      className={`cat-sound-item ${isDragging ? 'is-dragging' : ''} ${isSelected ? 'is-selected' : ''}`}
      style={{
        '--role': roleColor,
        '--note-darken': noteDarken,
      }}
      {...dragProps}
      // Совмещаем drag-слушатель dnd-kit с нашим pointerDown (когда drag включён)
      onPointerDown={(e) => { dragProps.onPointerDown?.(e); longPress.onPointerDown(e); }}
      onPointerMove={longPress.onPointerMove}
      onPointerUp={longPress.onPointerUp}
    >
      <span>{sound.name}</span>
      <div className="cat-sound-btns">
        <button
          className="sound-btn" title="Прослушать"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onPlay(); }}
        >{isPlaying ? '■' : '▶'}</button>
        {/* Звёздочка: по клику переключает жёлтый визуал избранного */}
        <button
          className={`sound-btn star-btn ${isFav ? 'is-favorite' : ''}`}
          title="В избранное"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onFav(); }}
        >{isFav ? '★' : '☆'}</button>
      </div>
    </div>
  );
}

// Перетаскиваемый избранный звук
function DraggableFavorite({ fav, isPlaying, onPlay, onRemove, isSelected, onSelect, onUnselect }) {        // Делаем так, чтобы звуки из favorite были Draggable
  // Для барабанов подпись без имени кота, для остальных - ИмяКота-Нота
  const label = fav.catCategory === 'Drums'
    ? fav.soundName
    : `${fav.catName}-${fav.soundName}`;

  // Затемнение по высоте ноты - такое же, как в меню кота (id 1..5)
  const noteDarken = fav.noteDarken ?? (fav.soundId - 1) * 6;

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

  const roleColors = {
    Lead: '#a78bfa',
    Bass: '#f472b6',
    Pad: '#34d399',
    Drums: '#fbbf24',
  };
  const roleColor = roleColors[fav.catCategory] || '#6f747c';

  // Логика выбора по долгому зажатию (1 сек без движения)
  const longPress = useLongPressSelect({ isSelected, onSelect, onUnselect });

  // У выбранного звука drag отключаем (см. комментарий в DraggableSound)
  const dragProps = isSelected ? {} : { ...listeners, ...attributes };

  return (
    <div
      ref={setNodeRef}
      className={`favorite-item ${isDragging ? 'is-dragging' : ''} ${isSelected ? 'is-selected' : ''}`}
      style={{
        '--role': roleColor,
        '--note-darken': noteDarken,
      }}
      {...dragProps}
      onPointerDown={(e) => { dragProps.onPointerDown?.(e); longPress.onPointerDown(e); }}
      onPointerMove={longPress.onPointerMove}
      onPointerUp={longPress.onPointerUp}
    >
      <div className="favorite-info">
        <span className="favorite-cat-name">{fav.catName}</span>
        <span className="favorite-sound-name">{fav.soundName}</span>
      </div>
      <div className="favorite-btns">
        <button
          className="sound-btn" title="Прослушать"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onPlay(); }}
        >{isPlaying ? '■' : '▶'}</button>
        <button
          className="sound-btn favorite-remove-btn" title="Удалить из избранного"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
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

  // Выбранный для вставки по клику звук и его переключатель (общий стор).
  // По нему подсвечиваем выбранный элемент в меню и избранном.
  const selectedSound = editorStore((state) => state.selectedSound);
  const selectSound = editorStore((state) => state.selectSound);
  const unselectIfSame = editorStore((state) => state.unselectIfSame);

  const { setNodeRef: setFavDropRef, isOver: isFavOver } = useDroppable({   // Дроппабл зона для избранного
    id: 'favorites-drop-zone',
  });

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
          catCategory: selectedCat.category,
          noteDarken: (sound.id - 1) * 6
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
            <span>🐱 No cat selected </span>
        )}
      </div>

      {selectedCat && (
        <div className="cat-name">{selectedCat.name}</div>
      )}

      {selectedSounds && selectedSounds.length > 0 ? (
        selectedSounds.map((sound) => {
          // Те же данные, что уходят в перетаскивание, плюс уникальный key источника
          const label = selectedCat.category === 'Drums'
            ? sound.name
            : `${selectedCat.name}-${sound.name}`;
          const noteDarken = (sound.id - 1) * 6;
          const soundKey = `sound-${selectedCat.name}-${sound.id}`;

          return (
            <DraggableSound
              key={sound.id}
              sound={sound}
              catName={selectedCat.name}
              category={selectedCat.category}
              isPlaying={playingId === sound.id}
              onPlay={() => handlePlaySound(sound)}
              isFav={!!favorites[`${selectedCat.name}-${sound.id}`]}
              onFav={() => toggleFavorite(sound)}
              isSelected={selectedSound?.key === soundKey}
              onSelect={() => selectSound({
                key: soundKey,
                label,
                sound: sound.sound,
                category: selectedCat.category,
                noteDarken,
              })}
              onUnselect={() => unselectIfSame(soundKey)}
            />
          );
        })
      ) : (
          <span className="cat-hint">Select a cat!</span>
      )}

      </div>

      <div className="favorites-divider">Favorites</div>

      {/* Список избранных звуков */}
      <div 
        className={`favorites-box ${isFavOver ? 'fav-drag-over' : ''}`}
        ref={setFavDropRef}
      >
        {favoriteList.length > 0 ? (
          favoriteList.map((fav) => {
            // Те же данные, что уходят в перетаскивание избранного
            const label = fav.catCategory === 'Drums'
              ? fav.soundName
              : `${fav.catName}-${fav.soundName}`;
            const noteDarken = fav.noteDarken ?? (fav.soundId - 1) * 6;
            const favKeyId = `fav-${fav.id}`;

            return (
              <DraggableFavorite
                key={fav.id}
                fav={fav}
                isPlaying={playingId === `fav-${fav.id}`}
                onPlay={() => handlePlayFavorite(fav.soundPath, fav.id)}
                onRemove={() => removeFromFavorites(fav.id)}
                isSelected={selectedSound?.key === favKeyId}
                onSelect={() => selectSound({
                  key: favKeyId,
                  label,
                  sound: fav.soundPath,
                  category: fav.catCategory,
                  noteDarken,
                })}
                onUnselect={() => unselectIfSame(favKeyId)}
              />
            );
          })
        ) : (
          <span className="favorites-empty-hint">Click ☆ or drag sound</span>
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