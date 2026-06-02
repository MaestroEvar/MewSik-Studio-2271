import Header from './components/layout/Header';
import LineSettings from './components/layout/LineSettings';
import Patterns from './components/layout/Patterns';
import TimeLine from './components/layout/TimeLine';
import Projects from './components/layout/Projects';
export default function App() {
  return (
    <div className="app-container">
      <Header />
      <Projects />
      <TimeLine />
      <LineSettings />
      <Patterns />
    </div>
  );
}
// Это пока только заглушка