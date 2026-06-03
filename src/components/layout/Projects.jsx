import { create } from 'zustand';
import './Projects.css';
import db from '../../db/db.js';
import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';

export default function Projects() {
    const [showModal, setShowModal] = useState(false);              // Показать/скрыть модальное окно
    const [newProjectName, setNewProjectName] = useState('');       // Добавляем поля ввода для создания проекта

    const projects = useLiveQuery(                                  // Получаем все проекты из БД
        () => db.projects.toArray(), []
    );

    const isLimitReached = projects && projects.length >= 5;        // Проверка лимита

    const handleOpenModal = (e) => {                                // Открыть модальное окно
        e.preventDefault();                                         // preventDefault(), отменяет поведение браузера, что при нажатии на <a> переносит нас на другую страницу
        if (isLimitReached) {
            alert('Maximum 5 projects!');
            return;
        }
        setShowModal(true);
    };

    const handleCreateProject = async (e) => {                      // Обработчик создания проекта
                                                                    // Создаем объект события(event)
                                                                    
        const name = newProjectName.trim();                         // Вводим название проекта
        if (!name) return;

        if (isLimitReached) {                                       
            alert('Maximum 5 projects!');
            return;
        }
        

        await db.projects.add({                                     // Добавляем проект в БД
            name: name,
            createdAt: new Date()
        });

        setNewProjectName('');                                      // Очищаем поле ввода
        setShowModal(false);                                        // Закрываем окно
    };

    const handleDeleteProject = async (id) => {                     // Удалить проект
        await db.projects.delete(id);
    }

    const handleCloseModal = (e) => {                               // Закрываем окно
        setShowModal(false);
        setNewProjectName('');
    };

    return (
        <div className="app-projects">
            <div className='create_project'>
                <a 
                    href=""
                    onClick={handleOpenModal}
                    className={isLimitReached ? 'disabled' : ''}
                    style={{
                        color: isLimitReached ? '#999' : '#000000',
                        cursor: isLimitReached ? 'not-allowed' : 'pointer',
                        opacity: isLimitReached ? 0.5 : 1
                    }}
                >
                    create project
                    
                    <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none"
                        stroke={isLimitReached ? "#999" : "currentColor"}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                    >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>

                    <div className='project_counter'>
                        {projects?.length || 0} / 5 projects
                    </div>
                </a>
            </div>

            <div className='projects'>
                {projects?.map(project => (
                    <div key={project.id} className='project_item' style={{backgroundColor: project.color}}>
                        {project.name}
                        <svg 
                            width="14" 
                            height="14" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <path d="M9 18V5l12-2v13" />
                            <circle cx="6" cy="18" r="3" />
                            <circle cx="18" cy="16" r="3" />
                        </svg>

                        <button
                            className='delete_btn'
                            onClick={() => handleDeleteProject(project.id)}
                            title='delete project'
                        >
                            <svg 
                                width="14" height="14" viewBox="0 0 24 24" 
                                fill="none" stroke="currentColor" 
                                strokeWidth="2" strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            { showModal && (
                <div className='modal_overlay' onClick={handleCloseModal}>
                    <div className='modal_content' onClick={(e) => e.stopPropagation()}>
                        <h3>new project</h3>

                        <input 
                            type="text"
                            className='modal_input'
                            placeholder='project name'
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                            autoFocus
                        />

                        <div className='modal_buttons'>
                            <button className='modal_btn cancel' onClick={handleCloseModal}>cancel</button>
                            <button className='modal_btn create' onClick={handleCreateProject}>create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}