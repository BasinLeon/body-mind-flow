import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../store/workoutStore';
import { useUserStore } from '../store/userStore';
import exerciseData from '../data/exercises.json';
import './ActiveWorkout.css';

export default function ActiveWorkout() {
    const navigate = useNavigate();
    const [showComplete, setShowComplete] = useState(false);
    const [workoutSummary, setWorkoutSummary] = useState(null);
    const [leveledUp, setLeveledUp] = useState(false);

    const {
        activeWorkout,
        currentExerciseIndex,
        currentSet,
        isResting,
        restTimeRemaining,
        completedSets,
        completeSet,
        tickRest,
        skipRest,
        isWorkoutComplete,
        getWorkoutSummary,
        finishWorkout,
        cancelWorkout
    } = useWorkoutStore();

    const { addXp, getCoachInfo, profile } = useUserStore();
    const coach = getCoachInfo();

    // Redirect if no active workout
    useEffect(() => {
        if (!activeWorkout) {
            navigate('/workout');
        }
    }, [activeWorkout, navigate]);

    // Rest timer
    useEffect(() => {
        if (isResting && restTimeRemaining > 0) {
            const timer = setInterval(tickRest, 1000);
            return () => clearInterval(timer);
        }
    }, [isResting, restTimeRemaining, tickRest]);

    // Check for workout completion
    useEffect(() => {
        if (activeWorkout && isWorkoutComplete()) {
            handleWorkoutComplete();
        }
    }, [completedSets]);

    const handleWorkoutComplete = useCallback(() => {
        const summary = getWorkoutSummary();
        setWorkoutSummary(summary);

        // Award XP
        if (summary) {
            const didLevelUp = addXp(summary.xpEarned);
            setLeveledUp(didLevelUp);
        }

        setShowComplete(true);
    }, [getWorkoutSummary, addXp]);

    const handleFinish = () => {
        finishWorkout();
        navigate('/');
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this workout? Progress will be lost.')) {
            cancelWorkout();
            navigate('/workout');
        }
    };

    if (!activeWorkout) return null;

    const currentExercise = activeWorkout.exercises[currentExerciseIndex];
    const category = exerciseData.categories.find(c => c.id === currentExercise?.exercise.category);

    // Progress calculations
    const totalSets = activeWorkout.exercises.reduce((sum, ex) => sum + ex.sets, 0);
    const progressPercent = (completedSets.length / totalSets) * 100;

    // Format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Get random coach encouragement
    const getEncouragement = () => {
        return coach.encouragement[Math.floor(Math.random() * coach.encouragement.length)];
    };

    // Workout Complete Screen
    if (showComplete && workoutSummary) {
        return (
            <div className="workout-complete">
                <div className="complete-content">
                    <div className="complete-icon">🎉</div>
                    <h1>Workout Complete!</h1>

                    {leveledUp && (
                        <div className="level-up-banner">
                            <span className="level-up-icon">⭐</span>
                            <span>LEVEL UP! You're now Level {profile.level}!</span>
                        </div>
                    )}

                    <div className="summary-card card">
                        <h2>{workoutSummary.workoutName}</h2>

                        <div className="summary-stats">
                            <div className="summary-stat">
                                <span className="summary-value">{workoutSummary.totalSets}</span>
                                <span className="summary-label">Sets</span>
                            </div>
                            <div className="summary-stat">
                                <span className="summary-value">{workoutSummary.totalReps}</span>
                                <span className="summary-label">Reps</span>
                            </div>
                            <div className="summary-stat">
                                <span className="summary-value">{workoutSummary.duration}</span>
                                <span className="summary-label">Minutes</span>
                            </div>
                        </div>

                        <div className="xp-earned">
                            <span className="xp-icon">✨</span>
                            <span className="xp-amount">+{workoutSummary.xpEarned} XP</span>
                        </div>
                    </div>

                    <div className="coach-praise">
                        <span className="coach-icon">{coach.icon}</span>
                        <p>"{getEncouragement()}"</p>
                    </div>

                    <button className="btn btn-primary btn-lg" onClick={handleFinish}>
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Rest Screen
    if (isResting) {
        return (
            <div className="active-workout rest-mode">
                <div className="workout-progress-bar">
                    <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>

                <div className="rest-screen">
                    <div className="rest-label">REST</div>

                    <div className="rest-timer">
                        <svg className="timer-circle" viewBox="0 0 100 100">
                            <circle
                                className="timer-bg"
                                cx="50" cy="50" r="45"
                            />
                            <circle
                                className="timer-progress"
                                cx="50" cy="50" r="45"
                                style={{
                                    strokeDasharray: 283,
                                    strokeDashoffset: 283 * (1 - restTimeRemaining / currentExercise.restSeconds)
                                }}
                            />
                        </svg>
                        <span className="timer-text">{restTimeRemaining}</span>
                    </div>

                    <div className="rest-breathwork">
                        <p className="breathwork-label">Breathwork</p>
                        <p className="breathwork-instruction">
                            Inhale deeply... Hold... Exhale slowly...
                        </p>
                    </div>

                    <div className="up-next">
                        <p className="up-next-label">Up Next</p>
                        <div className="up-next-exercise">
                            <span className="up-next-icon">{category?.icon}</span>
                            <span className="up-next-name">{currentExercise.exercise.name}</span>
                            <span className="up-next-set">Set {currentSet} of {currentExercise.sets}</span>
                        </div>
                    </div>

                    <button className="btn btn-secondary" onClick={skipRest}>
                        Skip Rest →
                    </button>
                </div>
            </div>
        );
    }

    // Active Exercise Screen
    return (
        <div className="active-workout">
            {/* Progress Bar */}
            <div className="workout-progress-bar">
                <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>

            {/* Header */}
            <header className="active-header">
                <button className="cancel-btn" onClick={handleCancel}>✕</button>
                <div className="workout-title">
                    <span className="workout-name">{activeWorkout.name}</span>
                    <span className="workout-progress">
                        {completedSets.length}/{totalSets} sets
                    </span>
                </div>
                <div className="xp-counter">
                    <span className="xp-icon">✨</span>
                    <span>+{completedSets.length > 0 ? completedSets.reduce((sum, s) => {
                        const ex = activeWorkout.exercises.find(e => e.exerciseId === s.exerciseId);
                        return sum + (ex?.exercise.xpReward || 0);
                    }, 0) : 0}</span>
                </div>
            </header>

            {/* Main Exercise Display */}
            <div className="exercise-display">
                <div className="exercise-badge" style={{ borderColor: category?.color }}>
                    {category?.icon}
                </div>

                <h1 className="exercise-name">{currentExercise.exercise.name}</h1>

                <div className="set-indicator">
                    <span className="set-current">Set {currentSet}</span>
                    <span className="set-total">of {currentExercise.sets}</span>
                </div>

                <div className="rep-target">
                    <span className="rep-count">{currentExercise.reps}</span>
                    <span className="rep-label">reps</span>
                </div>
            </div>

            {/* Flow Prompt */}
            <div className="flow-prompt-section">
                <div className="flow-icon">🧘</div>
                <p className="flow-text">"{currentExercise.exercise.flowPrompt}"</p>
            </div>

            {/* Form Cues */}
            <div className="form-cues-section">
                <h4>Form Cues</h4>
                <div className="cues-list">
                    {currentExercise.exercise.formCues.map((cue, i) => (
                        <span key={i} className="cue-item">✓ {cue}</span>
                    ))}
                </div>
            </div>

            {/* Complete Button */}
            <div className="complete-set-section">
                <button
                    className="complete-set-btn"
                    onClick={completeSet}
                >
                    <span className="check-icon">✓</span>
                    <span>Complete Set</span>
                    <span className="xp-reward">+{currentExercise.exercise.xpReward} XP</span>
                </button>
            </div>
        </div>
    );
}
