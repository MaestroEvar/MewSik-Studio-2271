import './Projects.css';
import { db } from '../../db/db.js';
import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';

/* ПАЛИТРА ЦВЕТОВ
   20 тёмных тонированных оттенков - все хорошо читаются с белым текстом.
   При создании проекта выбирается СЛУЧАЙНЫЙ цвет из этого массива.
   Если хочется больше цветов, их можно писать прямо сюда.
   Обязательно делайте их темными! Они потом подсвечиваются при выборе. */
const COLOR_PALETTE = [
  '#2a1f3d',
  '#3d1f5a',
  '#251a4a',
  '#1a2a3d',
  '#1a2050',
  '#142238',
  '#142e30',
  '#1a3535',
  '#0f2e2e',
  '#1a3028',
  '#1e3820',
  '#162a18',
  '#3d1a1a',
  '#4a1515',
  '#3a1010',
  '#2d2a1a',
  '#3a3010',
  '#2a2510',
  '#3d1a2a',
  '#3a1535',
];

/* Возвращает случайный цвет из палитры */
const getRandomColor = () =>
  COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];

export default function Projects() {
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedId, setSelectedId] = useState(null); // ID выбранного проекта

  const projects = useLiveQuery(
    () => db.projects.toArray(), []
  );

  const isLimitReached = projects && projects.length >= 5;

  /* Открыть модальное окно создания */
  const handleOpenModal = (e) => {
    e.preventDefault();
    if (isLimitReached) { alert('Maximum 5 projects!'); return; }
    setShowModal(true);
  };

  /* Создать проект со случайным цветом */
  const handleCreateProject = async () => {
    const name = newProjectName.trim();
    if (!name) return;
    if (isLimitReached) { alert('Maximum 5 projects!'); return; }

    await db.projects.add({
      name,
      createdAt: new Date(),
      color: getRandomColor(), // Достать случайный цвет
    });

    setNewProjectName('');
    setShowModal(false);
  };

  /* Удаление проекта, если удаляем выбранный, то сбрасываем выбор(подсветку) */
  const handleDeleteProject = async (e, id) => {
    e.stopPropagation();// Клик на корзину не должен выбирать проект
    await db.projects.delete(id);
    if (selectedId === id) setSelectedId(null);
  };

  /* Выбрать проект - повторный клик снимает выбор */
  const handleSelectProject = (id) => {
    setSelectedId(prev => prev === id ? null : id);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewProjectName('');
  };

  return (
    <div className="app-projects">

      {/* Шапка: кнопка + счётчик */}
      <div className="create_project">
        <a
          href=""
          onClick={handleOpenModal}
          className={isLimitReached ? 'disabled' : ''}
        >
          create project
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5"  y1="12" x2="19" y2="12" />
          </svg>
        </a>
        {/* Счётчик становится красным при достижении лимита */}
        <div className={`project_counter ${isLimitReached ? 'limit' : ''}`}>
          {projects?.length || 0} / 5 projects
        </div>
      </div>

      {/* Список Проектов */}
      <div className="projects">
        {projects?.map(project => {
          const isSelected = selectedId === project.id;
          return (
            <div
              key={project.id}
              className={`project_item ${isSelected ? 'selected' : ''}`}
              style={{ '--project-color': project.color }}  /* CSS-переменная для управления яркостью */
              onClick={() => handleSelectProject(project.id)}
              title={project.name}
            >
              {/* Декоративная иконка ноты */}
              <svg
                width="13" height="13" viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="project_note_icon"
              >
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>

              {/* Название */}
              <span className="project_name">{project.name}</span>

              {/* Кнопка удаления*/}
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
