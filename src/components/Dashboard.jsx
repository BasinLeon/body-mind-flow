import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import AICoach from './AICoach';
import exerciseData from '../data/exercises.json';
import progressionData from '../data/progressions.json';
import './Dashboard.css';

export default function Dashboard() {
    const [showCoach, setShowCoach] = useState(false);

    const {
        profile,
        currentStreak,
        stats,
        unlockedExercises,
        masteredExercises,
        getCoachInfo
    } = useUserStore();

    const coach = getCoachInfo();
    const levelThresholds = progressionData.levelThresholds;

    // Calculate XP progress to next level
    const currentLevelData = levelThresholds.find(l => l.level === profile.level);
    const nextLevelData = levelThresholds.find(l => l.level === profile.level + 1);

    const xpForCurrentLevel = currentLevelData?.xpRequired || 0;
    const xpForNextLevel = nextLevelData?.xpRequired || xpForCurrentLevel + 500;
    const xpProgress = profile.xp - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const progressPercent = Math.min((xpProgress / xpNeeded) * 100, 100);

    // Get a random encouragement from coach
    const encouragement = coach.encouragement[
        Math.floor(Math.random() * coach.encouragement.length)
    ];

    // Get skill tree progress
    const skillTreeProgress = progressionData.skillTrees.map(tree => {
        const totalNodes = tree.nodes.length;
        const unlockedNodes = tree.nodes.filter(n =>
            unlockedExercises.includes(n.exerciseId)
        ).length;
        const masteredNodes = tree.nodes.filter(n =>
            masteredExercises.includes(n.exerciseId)
        ).length;

        return {
            ...tree,
            totalNodes,
            unlockedNodes,
            masteredNodes,
            progress: (unlockedNodes / totalNodes) * 100
        };
    });

    return (
        <div className="dashboard">
            {/* Header Section */}
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>Welcome back, <span className="text-gradient">{profile.name}</span></h1>
                    <p>{coach.greeting}</p>
                </div>
                <div className="header-right">
                    <div className="streak-badge">
                        <span className="streak-icon">🔥</span>
                        <span className="streak-count">{currentStreak}</span>
                        <span className="streak-label">day streak</span>
                    </div>
                </div>
            </header>

            {/* Level Progress Card */}
            <section className="level-card card">
                <div className="level-info">
                    <div className="level-badge">
                        <span className="level-number">{profile.level}</span>
                    </div>
                    <div className="level-details">
                        <h3>{profile.title}</h3>
                        <p>{profile.xp.toLocaleString()} XP Total</p>
                    </div>
                </div>
                <div className="xp-progress">
                    <div className="xp-bar-container">
                        <div
                            className="xp-bar-fill"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <div className="xp-labels">
                        <span>{xpProgress} XP</span>
                        <span>{xpNeeded - xpProgress} XP to Level {profile.level + 1}</span>
                    </div>
                </div>
            </section>

            {/* Quick Stats */}
            <section className="stats-grid">
                <div className="stat-card card">
                    <div className="stat-value">{stats.totalWorkouts}</div>
                    <div className="stat-label">Workouts</div>
                </div>
                <div className="stat-card card">
                    <div className="stat-value">{stats.totalReps.toLocaleString()}</div>
                    <div className="stat-label">Total Reps</div>
                </div>
                <div className="stat-card card">
                    <div className="stat-value">{stats.totalMinutes}</div>
                    <div className="stat-label">Minutes</div>
                </div>
                <div className="stat-card card">
                    <div className="stat-value">{masteredExercises.length}</div>
                    <div className="stat-label">Mastered</div>
                </div>
            </section>

            {/* Coach Message - Clickable */}
            <section
                className="coach-message card-glass card clickable"
                onClick={() => setShowCoach(true)}
            >
                <div className="coach-avatar">{coach.icon}</div>
                <div className="coach-content">
                    <h4>{coach.name}</h4>
                    <p>"{encouragement}"</p>
                </div>
                <span className="chat-hint">💬 Chat</span>
            </section>

            {/* Skill Trees Preview */}
            <section className="skill-trees-section">
                <h2>Skill Trees</h2>
                <div className="skill-trees-grid">
                    {skillTreeProgress.map(tree => (
                        <Link key={tree.id} to="/skills" className="skill-tree-card card">
                            <div className="tree-header">
                                <span className="tree-icon">{tree.icon}</span>
                                <h4>{tree.name}</h4>
                            </div>
                            <div className="tree-progress-bar">
                                <div
                                    className="tree-progress-fill"
                                    style={{
                                        width: `${tree.progress}%`,
                                        background: tree.color
                                    }}
                                />
                            </div>
                            <div className="tree-stats">
                                <span>{tree.unlockedNodes}/{tree.totalNodes} unlocked</span>
                                <span>{tree.masteredNodes} mastered</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Quick Actions */}
            <section className="quick-actions">
                <Link to="/workout" className="btn btn-primary btn-lg">
                    <span>💪</span> Start Workout
                </Link>
                <Link to="/exercises" className="btn btn-secondary">
                    <span>📚</span> Exercise Library
                </Link>
                <Link to="/skills" className="btn btn-secondary">
                    <span>🗺️</span> Skill Trees
                </Link>
            </section>

            {/* Floating AI Coach Button */}
            <button
                className="ai-coach-fab"
                onClick={() => setShowCoach(true)}
                title="Chat with Coach"
            >
                {coach.icon}
            </button>

            {/* AI Coach Panel */}
            <AICoach isOpen={showCoach} onClose={() => setShowCoach(false)} />
        </div>
    );
}
