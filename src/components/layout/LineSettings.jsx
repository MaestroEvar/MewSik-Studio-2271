import './LineSettings.css';
import workInProgress from '../sprites/work_in_progress.png'; // Импортируем изображение

export default function LineSettings() {
    return <div className="app-linesettings">Line Settings 
    
    <p>Здесь будут настройки линий, которые можно будет сохранять в паттерны</p>
    <img src={workInProgress} alt="Work in progress" />
    </div>;
}