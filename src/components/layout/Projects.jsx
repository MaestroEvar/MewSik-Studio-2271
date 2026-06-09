import './Projects.css';
import { db } from '../../db/db.js';
import { useLiveQuery } from 'dexie-react-hooks';
import { useState, useEffect, useRef } from 'react';

const COLOR_PALETTE = [
  '#2a1f3d', '#3d1f5a', '#251a4a', '#1a2a3d', '#1a2050',
  '#142238', '#142e30', '#1a3535', '#0f2e2e', '#1a3028',
  '#1e3820', '#162a18', '#3d1a1a', '#4a1515', '#3a1010',
  '#2d2a1a', '#3a3010', '#2a2510', '#3d1a2a', '#3a1535',
];

const getRandomColor = () =>
  COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];

export default function Projects({ selectedProjectId, onSelectProject }) {
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  // На узких экранах (мобилка) панель проектов стартует свёрнутой, чтобы
  // не закрывать рабочую область. На десктопе - развёрнута как раньше.
  const [collapsed, setCollapsed] = useState(
    typeof window !== 'undefined' && window.innerWidth <= 900
  );

  // Синхронизируем класс контейнера с начальным состоянием свёрнутости
  useEffect(() => {
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      appContainer.classList.toggle('projects-collapsed', collapsed);
    }
  }, []);

  const projects = useLiveQuery(() => db.projects.toArray(), []);
  const isLimitReached = projects && projects.length >= 5;

  const defaultCreated = useRef(false);                               // Флаг, чтобы дефолтный проект создавался 1 раз
  const hasLoaded = useRef(false);

  useEffect(() => {                                                   // При первом рендере: если проектов нет, создаём MyFirstSong
    if (projects === undefined) return;                               // Ждем когда проекты загружатся

    if (!hasLoaded.current){
      hasLoaded.current = true;
      if (projects.length === 0 && !defaultCreated.current) {
        defaultCreated.current = true;
        db.projects.add({
          name: 'MyFirstSong',
          createdAt: new Date(),
          color: getRandomColor()
        });
      }
    }
  }, [projects]);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      appContainer.classList.toggle('projects-collapsed', next);
    }
  };

  const handleOpenModal = (e) => {
    e.preventDefault();
    if (isLimitReached) { alert('Maximum 5 projects!'); return; }
    setShowModal(true);
  };

  const handleCreateProject = async () => {
    const name = newProjectName.trim();
    if (!name) return;
    if (isLimitReached) { alert('Maximum 5 projects!'); return; }
    await db.projects.add({ name, createdAt: new Date(), color: getRandomColor() });
    setNewProjectName('');
    setShowModal(false);
  };

  const handleDeleteProject = async (e, id) => {
    e.stopPropagation();
    await db.projects.delete(id);
    if (selectedProjectId === id) onSelectProject(null);
  };

  const handleSelectProject = (id) => {
    onSelectProject(id);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewProjectName('');
  };

  const handleStartEdit = (e, project) => {
    e.stopPropagation();
    setEditingId(project.id);
    setEditName(project.name);
  };

  const handleSaveEdit = async (e) => {
    e.stopPropagation();
    const name = editName.trim();
    if (!name) return;
    await db.projects.update(editingId, { name });
    setEditingId(null);
    setEditName('');
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className={`app-projects${collapsed ? ' collapsed' : ''}`}>

      {/* Кнопка разворота */}
      {collapsed && (
        <button
          className="projects-toggle-btn-note"
          onClick={toggleCollapse}
          title="Развернуть панель проектов"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </button>
      )}

      {/* Весь контент скрыт когда свёрнуто */}
      <div className={`projects-content${collapsed ? ' hidden' : ''}`}>
        {/* Топбар с кнопкой сворачивания */}
        <div className="projects-topbar">
          <button
            className="projects-toggle-btn-minus"
            onClick={toggleCollapse}
            title="Свернуть панель"
          >
            -
          </button>
        </div>
        {/* Кнопка создания + счётчик */}
        <div className="create_project">
          <a
            href=""
            onClick={handleOpenModal}
            className={isLimitReached ? 'disabled' : ''}
          >
            Create project
            
          </a>
          <div className={`project_counter ${isLimitReached ? 'limit' : ''}`}>
            {projects?.length || 0} / 5 projects
          </div>
        </div>

        {/* Список Проектов */}
        <div className="projects">
          {projects?.map(project => {
            const isSelected = selectedProjectId === project.id;
            return (
              <div
                key={project.id}
                className={`project_item ${isSelected ? 'selected' : ''}`}
                style={{ '--project-color': project.color }}
                onClick={() => handleSelectProject(project.id)}
                title={project.name}
              >
                <svg width="13" height="13" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                     className="project_note_icon">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>

                {editingId === project.id ? (
                  <input
                    className="project_edit_input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(e);
                      if (e.key === 'Escape') handleCancelEdit(e);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                ) : (
                  <span className="project_name">{project.name}</span>
                )}

                {editingId === project.id ? (
                  <button className="edit_btn save" onClick={handleSaveEdit} title="Сохранить">✓</button>
                ) : (
                  <button className="edit_btn" onClick={(e) => handleStartEdit(e, project)} title="Переименовать">
                    <svg width="12" height="12" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor"
                         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                  </button>
                )}

                <button
                  className="delete_btn"
                  onClick={(e) => handleDeleteProject(e, project.id)}
                  title="delete project"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor"
                       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Модальное окно */}
      {showModal && (
        <div className="modal_overlay" onClick={handleCloseModal}>
          <div className="modal_content" onClick={(e) => e.stopPropagation()}>
            <h3>new project</h3>
            <input
              type="text"
              className="modal_input"
              placeholder="project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              autoFocus
            />
            <div className="modal_buttons">
              <button className="modal_btn cancel" onClick={handleCloseModal}>cancel</button>
              <button className="modal_btn create" onClick={handleCreateProject}>create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
