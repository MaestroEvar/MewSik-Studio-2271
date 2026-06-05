import './TimeLine.css';
import React, { useState, useRef } from 'react';

const tracks = [
    'Track1', 'Track2', 'Track3', 'Track4', 'Track5',
    'Track6', 'Track7', 'Track8', 'Track9', 'Track10'
];

const blocks = 16;
const subdivisions = 16; // 1/16 блока

export default function TimeLine({ selectedPattern, onClearSelection }) {
    const [patterns, setPatterns] = useState({});
    const [hoveredCell, setHoveredCell] = useState(null);
    const timelineRef = useRef(null);
    const tracksContainerRef = useRef(null);

    // Получить точную позицию клика внутри блока
    const getSubPosition = (e, element) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const subWidth = rect.width / subdivisions;
        const subIndex = Math.floor(x / subWidth);
        return Math.min(subIndex, subdivisions - 1);
    };

    const handleBlockClick = (trackIndex, blockIndex, e) => {
        e.stopPropagation();
        if (!selectedPattern) return;

        const subIndex = getSubPosition(e, e.currentTarget);
        
        // Создаём уникальный ключ для паттерна: трек + начальный блок + суб-позиция
        const patternKey = `${blockIndex}-${subIndex}`;

        // Если кликнули по уже размещённому паттерну - удаляем его
        if (patterns[trackIndex]?.[patternKey]?.id === selectedPattern.id) {
            handleRemovePattern(trackIndex, patternKey);
            return;
        }

        // Проверяем, не занята ли эта область другим паттерном
        if (isAreaOccupied(trackIndex, blockIndex, subIndex)) {
            return; // Область занята
        }

        // Размещаем паттерн (длиной 1 блок = 16 суб-делений)
        setPatterns(prev => ({
            ...prev,
            [trackIndex]: {
                ...(prev[trackIndex] || {}),
                [patternKey]: {
                    ...selectedPattern,
                    position: {
                        startBlock: blockIndex,
                        startSub: subIndex,
                        trackIndex: trackIndex,
                        length: subdivisions // Длина паттерна = 1 блок (16 суб-делений)
                    }
                }
            }
        }));
    };

    // Проверка, занята ли область
    const isAreaOccupied = (trackIndex, startBlock, startSub) => {
        const trackPatterns = patterns[trackIndex] || {};
        
        // Паттерн занимает от startBlock:startSub до startBlock+1:startSub
        const endBlock = startBlock + 1; // Длина 1 блок
        const endSub = startSub;
        
        // Конвертируем в абсолютные суб-деления
        const startAbsolute = startBlock * subdivisions + startSub;
        const endAbsolute = endBlock * subdivisions + endSub;
        
        // Проверяем пересечение с существующими паттернами
        for (const key in trackPatterns) {
            const pattern = trackPatterns[key];
            const pStartAbsolute = pattern.position.startBlock * subdivisions + pattern.position.startSub;
            const pEndAbsolute = pStartAbsolute + pattern.position.length;
            
            if (startAbsolute < pEndAbsolute && endAbsolute > pStartAbsolute) {
                return true; // Есть пересечение
            }
        }
        
        return false;
    };

    const handleRemovePattern = (trackIndex, patternKey) => {
        setPatterns(prev => {
            const trackPatterns = {...prev[trackIndex]};
            delete trackPatterns[patternKey];
            return {...prev, [trackIndex]: trackPatterns};
        });
    };

    const handleTimelineClick = (e) => {
        if (e.target === e.currentTarget || e.target.classList.contains('timeline_tracks')) {
            onClearSelection();
        }
    };

    const handleBlockMouseMove = (trackIndex, blockIndex, e) => {
        const subIndex = getSubPosition(e, e.currentTarget);
        setHoveredCell({ trackIndex, blockIndex, subIndex });
    };

    const handleBlockMouseLeave = () => {
        setHoveredCell(null);
    };

    // Получить паттерн для конкретного суб-деления
    const getPatternAtSub = (trackIndex, blockIndex, subIndex) => {
        const trackPatterns = patterns[trackIndex] || {};
        const absolutePos = blockIndex * subdivisions + subIndex;
        
        for (const key in trackPatterns) {
            const pattern = trackPatterns[key];
            const startAbsolute = pattern.position.startBlock * subdivisions + pattern.position.startSub;
            const endAbsolute = startAbsolute + pattern.position.length;
            
            if (absolutePos >= startAbsolute && absolutePos < endAbsolute) {
                return { pattern, patternKey: key };
            }
        }
        
        return null;
    };

    // Проверяем, попадает ли ховер в зону потенциального размещения
    const isInHoverZone = (trackIndex, blockIndex, subIndex) => {
        if (!hoveredCell || !selectedPattern) return false;
        if (hoveredCell.trackIndex !== trackIndex) return false;
        
        const hoverAbsolute = hoveredCell.blockIndex * subdivisions + hoveredCell.subIndex;
        const currentAbsolute = blockIndex * subdivisions + subIndex;
        
        // Паттерн длиной 1 блок
        const patternEnd = hoverAbsolute + subdivisions;
        
        return currentAbsolute >= hoverAbsolute && currentAbsolute < patternEnd;
    };

    return (
        <div className="app-timeline" onClick={handleTimelineClick} ref={timelineRef}>
            {selectedPattern && (
                <div className="selected-pattern-bar" style={{ backgroundColor: selectedPattern.color }}>
                    Выбран: {selectedPattern.name}
                    <button className="clear-btn" onClick={(e) => { e.stopPropagation(); onClearSelection(); }}>✕</button>
                </div>
            )}

            <div className='timeline_header'>
                <div className='header_label_spacer'/>

                {Array.from({ length: blocks }, (_, i) => (
                    <div key={i} className='header_block'>
                        <span className="block_number_main">{i + 1}</span>
                        <div className="header_subdivisions">
                            {Array.from({ length: subdivisions }, (_, si) => (
                                <div key={si} className="header_sub_mark">
                                    {si % 4 === 0 ? '·' : ''}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className='timeline_tracks' ref={tracksContainerRef}>
                {tracks.map((trackName, trackIndex) => (
                    <div key={trackIndex} className='timeline_track'>
                        <div className='track_label'>
                            <span className='track_number'>{trackIndex + 1}</span>
                        </div>

                        {/* Контейнер для блоков и паттернов */}
                        <div className='track_content'>
                            {/* Слой с блоками (сетка) */}
                            <div className='track_blocks'>
                                {Array.from({ length: blocks }, (_, blockIndex) => (
                                    <div
                                        key={blockIndex}
                                        className={`track_block ${blockIndex % 4 === 0 ? 'beat_start' : ''} ${selectedPattern ? 'has-selection' : ''}`}
                                        onMouseMove={(e) => handleBlockMouseMove(trackIndex, blockIndex, e)}
                                        onMouseLeave={handleBlockMouseLeave}
                                        onClick={(e) => handleBlockClick(trackIndex, blockIndex, e)}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            // Удаление всех паттернов в этом блоке
                                            const newPatterns = {...patterns};
                                            if (newPatterns[trackIndex]) {
                                                const keysToDelete = [];
                                                Object.keys(newPatterns[trackIndex]).forEach(key => {
                                                    const pattern = newPatterns[trackIndex][key];
                                                    const pStartBlock = pattern.position.startBlock;
                                                    const pEndBlock = Math.floor((pattern.position.startBlock * subdivisions + pattern.position.startSub + pattern.position.length - 1) / subdivisions);
                                                    if (blockIndex >= pStartBlock && blockIndex <= pEndBlock) {
                                                        keysToDelete.push(key);
                                                    }
                                                });
                                                keysToDelete.forEach(key => delete newPatterns[trackIndex][key]);
                                                if (Object.keys(newPatterns[trackIndex]).length === 0) {
                                                    delete newPatterns[trackIndex];
                                                }
                                                setPatterns(newPatterns);
                                            }
                                        }}
                                    >
                                        {/* Суб-деления для визуальной сетки и ховера */}
                                        <div className="sub_divisions_container">
                                            {Array.from({ length: subdivisions }, (_, subIndex) => {
                                                const patternData = getPatternAtSub(trackIndex, blockIndex, subIndex);
                                                const isHoverPreview = isInHoverZone(trackIndex, blockIndex, subIndex) && !patternData;
                                                
                                                return (
                                                    <div
                                                        key={subIndex}
                                                        className={`sub_division ${isHoverPreview ? 'hover_preview' : ''} ${patternData ? 'occupied' : ''}`}
                                                        style={{
                                                            width: `${100 / subdivisions}%`,
                                                            height: '100%',
                                                            ...(isHoverPreview && { backgroundColor: selectedPattern.color + '20' })
                                                        }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Слой с паттернами (поверх сетки) */}
                            <div className='track_patterns_layer'>
                                {Object.entries(patterns[trackIndex] || {}).map(([patternKey, pattern]) => {
                                    const isSelected = selectedPattern && pattern.id === selectedPattern.id;
                                    const startPercent = ((pattern.position.startBlock * subdivisions + pattern.position.startSub) / (blocks * subdivisions)) * 100;
                                    const widthPercent = (pattern.position.length / (blocks * subdivisions)) * 100;
                                    
                                    return (
                                        <div
                                            key={patternKey}
                                            className={`placed_pattern_full ${isSelected ? 'selected' : ''}`}
                                            style={{
                                                backgroundColor: pattern.color,
                                                left: `${startPercent}%`,
                                                width: `${widthPercent}%`
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemovePattern(trackIndex, patternKey);
                                            }}
                                        >
                                            {pattern.name}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}