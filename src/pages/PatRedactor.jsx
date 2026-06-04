import React, { useState } from 'react';
import PatHeader from '../components/pat-layout/PatHeader';
import PatSidebar from '../components/pat-layout/PatSidebar';
import PatTrackRow from '../components/pat-layout/PatTrackRow';
import SequencerControls from '../components/pat-layout/SequencerControls';
import Library from '../components/pat-layout/Library';
import './PatRedactor.css'; // Общие стили для сетки и раскладки остаются тут

export default function PatRedactor({ onBackToStudio }) {
  const tracks = ['Kick Drum', 'Snare', 'Closed Hat', 'Open Hat', 'Clap'];

  const [volumes, setVolumes] = useState([50, 50, 50, 50, 50]);

  const handleVolumeChange = (index, newValue) => {
    const updatedVolumes = [...volumes];
    updatedVolumes[index] = Number(newValue);
    setVolumes(updatedVolumes);
  };

  return (
    <div className="pat-redactor-container">
      {/* Шапка */}
      <PatHeader />

      <div className="pat-workspace">
        {/* 2. Левая колонка со звуками и кнопкой возврата */}
        <PatSidebar
          tracks={tracks}
          onBackToStudio={onBackToStudio}
        />

        {/* 3. Правая часть экрана, разделенная на дорожки и библиотеку */}
        <div className="pat-right-content">

          {/* Верхняя половина: дорожки секвенсора */}
          <main className="pat-tracks-area">

            {/* Панель управления над дорожками: Play и Save.
                Заполняет пустое пространство между шапкой и сеткой. */}
            <SequencerControls />

            <div className="sequencer-table">
              {tracks.map((trackName, trackIndex) => (
                <PatTrackRow
                  key={trackIndex}
                  trackIndex={trackIndex}
                  volume={volumes[trackIndex]}
                  onVolumeChange={(val) => handleVolumeChange(trackIndex, val)}
                />
              ))}
            </div>
          </main>

          {/* Нижняя половина: страница библиотеки */}
          <section className="pat-library-area">
            <Library />
          </section>

        </div>
      </div>
    </div>
  );
}
