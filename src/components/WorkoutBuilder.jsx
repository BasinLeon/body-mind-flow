import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useWorkoutStore } from '../store/workoutStore';
import exerciseData from '../data/exercises.json';
import './WorkoutBuilder.css';

export default function WorkoutBuilder() {
    const navigate = useNavigate();
    const [workoutName, setWorkoutName] = useState('New Workout');
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [showExercisePicker, setShowExercisePicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const { saveWorkout, savedWorkouts, startWorkout } = useWorkoutStore();
    const { unlockedExercises } = useUserStore();

    // Filter exercises for picker
    const availableExercises = useMemo(() => {
        return exerciseData.exercises.filter(ex => {
            const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || ex.category === categoryFilter;
            const isUnlocked = unlockedExercises.includes(ex.id);
            return matchesSearch && matchesCategory && isUnlocked;
        });
    }, [searchQuery, categoryFilter, unlockedExercises]);

    const addExercise = (exercise) => {
        setSelectedExercises(prev => [
            ...prev,
            {
                id: Date.now(),
                exerciseId: exercise.id,
                exercise: exercise,
                sets: 3,
                reps: 10,
                restSeconds: 60
            }
        ]);
        setShowExercisePicker(false);
    };

    const removeExercise = (id) => {
        setSelectedExercises(prev => prev.filter(ex => ex.id !== id));
    };

    const updateExercise = (id, field, value) => {
        setSelectedExercises(prev => prev.map(ex =>
            ex.id === id ? { ...ex, [field]: parseInt(value) || 0 } : ex
        ));
    };

    const moveExercise = (index, direction) => {
        const newExercises = [...selectedExercises];
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= newExercises.length) return;
        [newExercises[index], newExercises[newIndex]] = [newExercises[newIndex], newExercises[index]];
        setSelectedExercises(newExercises);
    };

    const handleSaveWorkout = () => {
        if (selectedExercises.length === 0) return;

        const workout = {
            id: Date.now(),
            name: workoutName,
            exercises: selectedExercises,
            createdAt: new Date().toISOString()
        };

        saveWorkout(workout);
        alert('Workout saved!');
    };

    const handleStartWorkout = () => {
        if (selectedExercises.length === 0) return;

        const workout = {
            id: Date.now(),
            name: workoutName,
            exercises: selectedExercises,
            createdAt: new Date().toISOString()
        };

        startWorkout(workout);
        navigate('/active-workout');
    };

    const loadSavedWorkout = (workout) => {
        setWorkoutName(workout.name);
        setSelectedExercises(workout.exercises);
    };

    // Calculate total stats
    const totalSets = selectedExercises.reduce((sum, ex) => sum + ex.sets, 0);
    const totalReps = selectedExercises.reduce((sum, ex) => sum + (ex.sets * ex.reps), 0);
    const estimatedXp = selectedExercises.reduce((sum, ex) => sum + (ex.exercise.xpReward * ex.sets), 0);
    const estimatedMinutes = Math.round(selectedExercises.reduce((sum, ex) =>
        sum + (ex.sets * 0.5) + (ex.sets * ex.restSeconds / 60), 0
    ));

    return (
        <div className="workout-builder">
            <header className="builder-header">
                <div className="header-left">
                    <h1>Workout Builder</h1>
                    <input
                        type="text"
                        className="workout-name-input"
                        value={workoutName}
                        onChange={(e) => setWorkoutName(e.target.value)}
                        placeholder="Workout name..."
                    />
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={handleSaveWorkout} disabled={selectedExercises.length === 0}>
                        💾 Save
                    </button>
                    <button className="btn btn-primary btn-lg" onClick={handleStartWorkout} disabled={selectedExercises.length === 0}>
                        ▶️ Start Workout
                    </button>
                </div>
            </header>

            {/* Stats Preview */}
            <div className="workout-stats">
                <div className="stat-item">
                    <span className="stat-value">{selectedExercises.length}</span>
                    <span className="stat-label">Exercises</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{totalSets}</span>
                    <span className="stat-label">Sets</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{totalReps}</span>
                    <span className="stat-label">Reps</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">~{estimatedMinutes}</span>
                    <span className="stat-label">Minutes</span>
                </div>
                <div className="stat-item xp-stat">
                    <span className="stat-value">+{estimatedXp}</span>
                    <span className="stat-label">XP</span>
                </div>
            </div>

            <div className="builder-content">
                {/* Main Builder Area */}
                <div className="builder-main">
                    {selectedExercises.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🏋️</div>
                            <h3>No exercises yet</h3>
                            <p>Add exercises to build your workout</p>
                            <button className="btn btn-primary" onClick={() => setShowExercisePicker(true)}>
                                + Add Exercise
                            </button>
                        </div>
                    ) : (
                        <div className="exercise-list">
                            {selectedExercises.map((item, index) => {
                                const category = exerciseData.categories.find(c => c.id === item.exercise.category);
                                return (
                                    <div key={item.id} className="exercise-item card">
                                        <div className="exercise-order">{index + 1}</div>

                                        <div className="exercise-info">
                                            <span className="category-icon" style={{ borderColor: category?.color }}>
                                                {category?.icon}
                                            </span>
                                            <div className="exercise-details">
                                                <h4>{item.exercise.name}</h4>
                                                <span className="xp-badge">+{item.exercise.xpReward} XP/set</span>
                                            </div>
                                        </div>

                                        <div className="exercise-config">
                                            <div className="config-field">
                                                <label>Sets</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={item.sets}
                                                    onChange={(e) => updateExercise(item.id, 'sets', e.target.value)}
                                                />
                                            </div>
                                            <div className="config-field">
                                                <label>Reps</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="100"
                                                    value={item.reps}
                                                    onChange={(e) => updateExercise(item.id, 'reps', e.target.value)}
                                                />
                                            </div>
                                            <div className="config-field">
                                                <label>Rest (s)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="300"
                                                    step="15"
                                                    value={item.restSeconds}
                                                    onChange={(e) => updateExercise(item.id, 'restSeconds', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="exercise-actions">
                                            <button
                                                className="action-btn"
                                                onClick={() => moveExercise(index, -1)}
                                                disabled={index === 0}
                                            >
                                                ↑
                                            </button>
                                            <button
                                                className="action-btn"
                                                onClick={() => moveExercise(index, 1)}
                                                disabled={index === selectedExercises.length - 1}
                                            >
                                                ↓
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => removeExercise(item.id)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            <button
                                className="add-exercise-btn"
                                onClick={() => setShowExercisePicker(true)}
                            >
                                + Add Exercise
                            </button>
                        </div>
                    )}
                </div>

                {/* Saved Workouts Sidebar */}
                <div className="builder-sidebar">
                    <h3>Saved Workouts</h3>
                    {savedWorkouts.length === 0 ? (
                        <p className="no-saved">No saved workouts yet</p>
                    ) : (
                        <div className="saved-list">
                            {savedWorkouts.map(workout => (
                                <button
                                    key={workout.id}
                                    className="saved-workout-btn"
                                    onClick={() => loadSavedWorkout(workout)}
                                >
                                    <span className="workout-name">{workout.name}</span>
                                    <span className="workout-meta">{workout.exercises.length} exercises</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Exercise Picker Modal */}
            {showExercisePicker && (
                <div className="modal-overlay" onClick={() => setShowExercisePicker(false)}>
                    <div className="modal picker-modal" onClick={e => e.stopPropagation()}>
                        <div className="picker-header">
                            <h2>Add Exercise</h2>
                            <button className="modal-close" onClick={() => setShowExercisePicker(false)}>✕</button>
                        </div>

                        <div className="picker-filters">
                            <input
                                type="text"
                                placeholder="Search exercises..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <div className="category-tabs">
                                <button
                                    className={categoryFilter === 'all' ? 'active' : ''}
                                    onClick={() => setCategoryFilter('all')}
                                >
                                    All
                                </button>
                                {exerciseData.categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        className={categoryFilter === cat.id ? 'active' : ''}
                                        onClick={() => setCategoryFilter(cat.id)}
                                    >
                                        {cat.icon} {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="picker-list">
                            {availableExercises.map(exercise => {
                                const category = exerciseData.categories.find(c => c.id === exercise.category);
                                const alreadyAdded = selectedExercises.some(ex => ex.exerciseId === exercise.id);

                                return (
                                    <button
                                        key={exercise.id}
                                        className={`picker-item ${alreadyAdded ? 'added' : ''}`}
                                        onClick={() => !alreadyAdded && addExercise(exercise)}
                                        disabled={alreadyAdded}
                                    >
                                        <span className="picker-icon" style={{ borderColor: category?.color }}>
                                            {category?.icon}
                                        </span>
                                        <div className="picker-info">
                                            <span className="picker-name">{exercise.name}</span>
                                            <span className="picker-muscles">
                                                {exercise.muscleGroups.slice(0, 3).join(', ')}
                                            </span>
                                        </div>
                                        <span className="picker-xp">+{exercise.xpReward} XP</span>
                                        {alreadyAdded && <span className="added-badge">Added</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
