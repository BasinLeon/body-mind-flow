import { useState, useMemo } from 'react';
import { useUserStore } from '../store/userStore';
import exerciseData from '../data/exercises.json';
import './ExerciseLibrary.css';

export default function ExerciseLibrary() {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    const [selectedExercise, setSelectedExercise] = useState(null);

    const { unlockedExercises, masteredExercises } = useUserStore();

    const filteredExercises = useMemo(() => {
        return exerciseData.exercises.filter(ex => {
            const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
                ex.muscleGroups.some(mg => mg.toLowerCase().includes(search.toLowerCase()));
            const matchesCategory = categoryFilter === 'all' || ex.category === categoryFilter;
            const matchesDifficulty = difficultyFilter === 'all' || ex.difficulty === parseInt(difficultyFilter);

            return matchesSearch && matchesCategory && matchesDifficulty;
        });
    }, [search, categoryFilter, difficultyFilter]);

    const getExerciseStatus = (exerciseId) => {
        if (masteredExercises.includes(exerciseId)) return 'mastered';
        if (unlockedExercises.includes(exerciseId)) return 'unlocked';
        return 'locked';
    };

    const renderDifficulty = (level) => {
        return (
            <div className="difficulty">
                {[1, 2, 3, 4, 5].map(i => (
                    <div
                        key={i}
                        className={`difficulty-dot ${i <= level ? 'filled' : ''}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="exercise-library">
            {/* Header & Filters */}
            <header className="library-header">
                <h1>Exercise Library</h1>
                <p>Open-source collection of bodyweight movements</p>
            </header>

            <div className="library-filters">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search exercises or muscle groups..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {exerciseData.categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.icon} {cat.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                    >
                        <option value="all">All Difficulties</option>
                        <option value="1">⭐ Beginner</option>
                        <option value="2">⭐⭐ Easy</option>
                        <option value="3">⭐⭐⭐ Moderate</option>
                        <option value="4">⭐⭐⭐⭐ Hard</option>
                        <option value="5">⭐⭐⭐⭐⭐ Expert</option>
                    </select>
                </div>
            </div>

            {/* Exercise Grid */}
            <div className="exercise-grid">
                {filteredExercises.map(exercise => {
                    const status = getExerciseStatus(exercise.id);
                    const category = exerciseData.categories.find(c => c.id === exercise.category);

                    return (
                        <div
                            key={exercise.id}
                            className={`exercise-card card ${status}`}
                            onClick={() => setSelectedExercise(exercise)}
                        >
                            <div className="exercise-header">
                                <span
                                    className="category-badge"
                                    style={{ borderColor: category?.color }}
                                >
                                    {category?.icon}
                                </span>
                                <div className="status-badge">
                                    {status === 'mastered' && <span className="badge badge-gold">✨ Mastered</span>}
                                    {status === 'locked' && <span className="badge">🔒 Locked</span>}
                                </div>
                            </div>

                            <h3>{exercise.name}</h3>

                            <div className="exercise-meta">
                                {renderDifficulty(exercise.difficulty)}
                                <span className="xp-reward">+{exercise.xpReward} XP</span>
                            </div>

                            <div className="muscle-groups">
                                {exercise.muscleGroups.slice(0, 3).map(mg => (
                                    <span key={mg} className="muscle-tag">{mg}</span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Exercise Detail Modal */}
            {selectedExercise && (
                <div className="modal-overlay" onClick={() => setSelectedExercise(null)}>
                    <div className="modal card-glass" onClick={e => e.stopPropagation()}>
                        <button
                            className="modal-close"
                            onClick={() => setSelectedExercise(null)}
                        >
                            ✕
                        </button>

                        <div className="modal-header">
                            <h2>{selectedExercise.name}</h2>
                            {renderDifficulty(selectedExercise.difficulty)}
                        </div>

                        <p className="exercise-description">{selectedExercise.description}</p>

                        <div className="flow-prompt">
                            <h4>🧘 Flow Prompt</h4>
                            <p>"{selectedExercise.flowPrompt}"</p>
                        </div>

                        <div className="form-cues">
                            <h4>📋 Form Cues</h4>
                            <ul>
                                {selectedExercise.formCues.map((cue, i) => (
                                    <li key={i}>{cue}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="muscle-groups-detail">
                            <h4>💪 Muscle Groups</h4>
                            <div className="tags">
                                {selectedExercise.muscleGroups.map(mg => (
                                    <span key={mg} className="muscle-tag">{mg}</span>
                                ))}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <span className="xp-reward-large">+{selectedExercise.xpReward} XP per set</span>
                            <button className="btn btn-primary">Add to Workout</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
