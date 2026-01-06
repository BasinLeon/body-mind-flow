import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { useUserStore } from './store/userStore';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import ExerciseLibrary from './components/ExerciseLibrary';
import './styles/index.css';

function Navigation() {
  const { profile } = useUserStore();

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

function AppContent() {
  const { onboardingComplete } = useUserStore();

  if (!onboardingComplete) {
    return <Onboarding />;
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/exercises" element={<ExerciseLibrary />} />
            <Route path="/skills" element={<SkillTreesPlaceholder />} />
            <Route path="/workout" element={<WorkoutPlaceholder />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

// Placeholder components for routes not yet built
function SkillTreesPlaceholder() {
  return (
    <div className="placeholder-page">
      <div className="placeholder-icon">🗺️</div>
      <h1>Skill Trees</h1>
      <p>Interactive skill progression maps coming soon!</p>
    </div>
  );
}

function WorkoutPlaceholder() {
  return (
    <div className="placeholder-page">
      <div className="placeholder-icon">💪</div>
      <h1>Workout Builder</h1>
      <p>Create and track your workouts here. Coming soon!</p>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
