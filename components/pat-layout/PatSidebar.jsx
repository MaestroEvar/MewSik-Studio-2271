import React from 'react';

export default function PatSidebar({ tracks, onOpenLibrary, onBackToStudio }) {
  return (
    <aside className="pat-sounds-sidebar">
      <div className="sidebar-title">Tracks & Sounds</div>
      
      <div className="sidebar-sounds-list">
        {tracks.map((trackName, index) => (
          <div key={index} className="sidebar-sound-item">
            {trackName}
          </div>
        ))}
      </div>

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