import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialState = {
    // Saved workout templates
    savedWorkouts: [],

    // Active workout state
    activeWorkout: null,
    currentExerciseIndex: 0,
    currentSet: 1,
    isResting: false,
    restTimeRemaining: 0,
    completedSets: [],
    workoutStartTime: null,

    // Workout history
    completedWorkouts: []
};

export const useWorkoutStore = create(
    persist(
        (set, get) => ({
            ...initialState,

            // Save a workout template
            saveWorkout: (workout) => set((state) => ({
                savedWorkouts: [
                    workout,
                    ...state.savedWorkouts.filter(w => w.id !== workout.id)
                ]
            })),

            // Delete a saved workout
            deleteWorkout: (workoutId) => set((state) => ({
                savedWorkouts: state.savedWorkouts.filter(w => w.id !== workoutId)
            })),

            // Start an active workout
            startWorkout: (workout) => set({
                activeWorkout: workout,
                currentExerciseIndex: 0,
                currentSet: 1,
                isResting: false,
                restTimeRemaining: 0,
                completedSets: [],
                workoutStartTime: new Date().toISOString()
            }),

            // Complete a set
            completeSet: () => {
                const state = get();
                const { activeWorkout, currentExerciseIndex, currentSet } = state;

                if (!activeWorkout) return;

                const currentExercise = activeWorkout.exercises[currentExerciseIndex];
                const newCompletedSet = {
                    exerciseId: currentExercise.exerciseId,
                    exerciseIndex: currentExerciseIndex,
                    set: currentSet,
                    completedAt: new Date().toISOString()
                };

                const isLastSetOfExercise = currentSet >= currentExercise.sets;
                const isLastExercise = currentExerciseIndex >= activeWorkout.exercises.length - 1;

                if (isLastSetOfExercise && isLastExercise) {
                    // Workout complete - this will be handled by the component
                    set({
                        completedSets: [...state.completedSets, newCompletedSet]
                    });
                } else if (isLastSetOfExercise) {
                    // Move to next exercise
                    set({
                        completedSets: [...state.completedSets, newCompletedSet],
                        currentExerciseIndex: currentExerciseIndex + 1,
                        currentSet: 1,
                        isResting: true,
                        restTimeRemaining: currentExercise.restSeconds
                    });
                } else {
                    // Next set of same exercise
                    set({
                        completedSets: [...state.completedSets, newCompletedSet],
                        currentSet: currentSet + 1,
                        isResting: true,
                        restTimeRemaining: currentExercise.restSeconds
                    });
                }
            },

            // Update rest timer
            tickRest: () => {
                const state = get();
                if (state.restTimeRemaining > 0) {
                    set({ restTimeRemaining: state.restTimeRemaining - 1 });
                } else {
                    set({ isResting: false });
                }
            },

            // Skip rest
            skipRest: () => set({
                isResting: false,
                restTimeRemaining: 0
            }),

            // Check if workout is complete
            isWorkoutComplete: () => {
                const state = get();
                if (!state.activeWorkout) return false;

                const totalSets = state.activeWorkout.exercises.reduce(
                    (sum, ex) => sum + ex.sets, 0
                );

                return state.completedSets.length >= totalSets;
            },

            // Get workout summary
            getWorkoutSummary: () => {
                const state = get();
                if (!state.activeWorkout) return null;

                const totalSets = state.completedSets.length;
                const totalReps = state.activeWorkout.exercises.reduce((sum, ex) => {
                    const completedSetsForExercise = state.completedSets.filter(
                        s => s.exerciseId === ex.exerciseId
                    ).length;
                    return sum + (completedSetsForExercise * ex.reps);
                }, 0);

                const xpEarned = state.activeWorkout.exercises.reduce((sum, ex) => {
                    const completedSetsForExercise = state.completedSets.filter(
                        s => s.exerciseId === ex.exerciseId
                    ).length;
                    return sum + (completedSetsForExercise * ex.exercise.xpReward);
                }, 0);

                const duration = state.workoutStartTime
                    ? Math.round((new Date() - new Date(state.workoutStartTime)) / 60000)
                    : 0;

                return {
                    workoutName: state.activeWorkout.name,
                    totalSets,
                    totalReps,
                    xpEarned,
                    duration,
                    exercisesCompleted: state.activeWorkout.exercises.length
                };
            },

            // Finish workout
            finishWorkout: () => {
                const state = get();
                const summary = state.getWorkoutSummary();

                if (summary) {
                    set({
                        completedWorkouts: [
                            {
                                ...summary,
                                id: Date.now(),
                                completedAt: new Date().toISOString()
                            },
                            ...state.completedWorkouts
                        ]
                    });
                }

                set({
                    activeWorkout: null,
                    currentExerciseIndex: 0,
                    currentSet: 1,
                    isResting: false,
                    restTimeRemaining: 0,
                    completedSets: [],
                    workoutStartTime: null
                });

                return summary;
            },

            // Cancel workout
            cancelWorkout: () => set({
                activeWorkout: null,
                currentExerciseIndex: 0,
                currentSet: 1,
                isResting: false,
                restTimeRemaining: 0,
                completedSets: [],
                workoutStartTime: null
            })
        }),
        {
            name: 'flow-workout-storage'
        }
    )
);
