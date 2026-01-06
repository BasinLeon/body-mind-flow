import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useUserStore } from './store/userStore';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import ExerciseLibrary from './components/ExerciseLibrary';
import WorkoutBuilder from './components/WorkoutBuilder';
import ActiveWorkout from './components/ActiveWorkout';
import SkillTrees from './components/SkillTrees';
import './styles/index.css';

function Navigation() {
  const { profile } = useUserStore();
  const location = useLocation();

  // Hide nav during active workout
  if (location.pathname === '/active-workout') {
    return null;
  }

  return (
    <nav className="nav">
      <div className="nav-brand">
        <span className="brand-icon">🌊</span>
        <span className="brand-text">FLOW</span>
      </div>

      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Dashboard
        </NavLink>
        <NavLink to="/exercises" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Exercises
        </NavLink>
        <NavLink to="/skills" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Skill Trees
        </NavLink>
        <NavLink to="/workout" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Workout
        </NavLink>
      </div>

      <div className="nav-user">
        <div className="user-level">
          <span className="level-indicator">Lvl {profile.level}</span>
          <span className="user-name">{profile.name}</span>
        </div>
      </div>
    </nav>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isActiveWorkout = location.pathname === '/active-workout';

  return (
    <div className="app">
      <Navigation />
      <main className={`main-content ${isActiveWorkout ? 'fullscreen' : ''}`}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/exercises" element={<ExerciseLibrary />} />
          <Route path="/skills" element={<SkillTrees />} />
          <Route path="/workout" element={<WorkoutBuilder />} />
          <Route path="/active-workout" element={<ActiveWorkout />} />
        </Routes>
      </main>
    </div>
  );
}

function AppContent() {
  const { onboardingComplete } = useUserStore();

  if (!onboardingComplete) {
    return <Onboarding />;
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default function App() {
  return <AppContent />;
}
