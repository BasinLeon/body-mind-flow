import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const AI_COACH_STYLES = {
  mentor: {
    id: 'mentor',
    name: 'Wise Mentor',
    icon: '🧘',
    description: 'Calm, philosophical guidance with deep wisdom',
    greeting: "Welcome back, student. The path of mastery awaits.",
    encouragement: [
      "Remember: every master was once a beginner who refused to give up.",
      "The body achieves what the mind believes.",
      "Progress is not always linear. Trust the process.",
      "In stillness, we find strength. In movement, we find peace."
    ]
  },
  hype: {
    id: 'hype',
    name: 'Hype Coach',
    icon: '🔥',
    description: 'High-energy motivation to push your limits',
    greeting: "LET'S GO! Time to crush it! 💪",
    encouragement: [
      "You're UNSTOPPABLE! One more rep!",
      "That's what I'm talking about! BEAST MODE!",
      "No excuses, just results! You've got this!",
      "Every rep is a step toward GREATNESS!"
    ]
  },
  balanced: {
    id: 'balanced',
    name: 'Adaptive Guide',
    icon: '⚖️',
    description: 'Matches your energy and needs',
    greeting: "Good to see you. Ready to train?",
    encouragement: [
      "Great work. Keep that form solid.",
      "You're making real progress here.",
      "Take your time. Quality over quantity.",
      "Strong effort. Let's keep building."
    ]
  }
};

const initialState = {
  // User Profile
  profile: {
    name: '',
    level: 1,
    xp: 0,
    title: 'Novice',
    createdAt: null,
    skillLevel: null, // 'beginner', 'intermediate', 'advanced'
    goals: [],
    coachStyle: 'balanced'
  },
  
  // Onboarding
  onboardingComplete: false,
  
  // Progress Tracking
  unlockedExercises: ['wall-push-up', 'dead-hang', 'squat', 'plank'],
  masteredExercises: [],
  exerciseProgress: {},
  
  // Workout History
  workoutHistory: [],
  currentStreak: 0,
  longestStreak: 0,
  lastWorkoutDate: null,
  
  // Achievements
  achievements: [],
  
  // Stats
  stats: {
    totalWorkouts: 0,
    totalXpEarned: 0,
    totalReps: 0,
    totalMinutes: 0
  }
};

export const useUserStore = create(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Profile Actions
      setProfile: (updates) => set((state) => ({
        profile: { ...state.profile, ...updates }
      })),
      
      setCoachStyle: (style) => set((state) => ({
        profile: { ...state.profile, coachStyle: style }
      })),
      
      completeOnboarding: (data) => set({
        onboardingComplete: true,
        profile: {
          ...get().profile,
          ...data,
          createdAt: new Date().toISOString()
        }
      }),
      
      // XP & Leveling
      addXp: (amount) => {
        const state = get();
        const newXp = state.profile.xp + amount;
        
        // Import level thresholds dynamically
        const levelThresholds = [
          { level: 1, xpRequired: 0, title: 'Novice' },
          { level: 2, xpRequired: 100, title: 'Apprentice' },
          { level: 3, xpRequired: 250, title: 'Initiate' },
          { level: 4, xpRequired: 500, title: 'Practitioner' },
          { level: 5, xpRequired: 850, title: 'Adept' },
          { level: 6, xpRequired: 1300, title: 'Journeyman' },
          { level: 7, xpRequired: 1900, title: 'Expert' },
          { level: 8, xpRequired: 2700, title: 'Master' },
          { level: 9, xpRequired: 3800, title: 'Grandmaster' },
          { level: 10, xpRequired: 5200, title: 'Legend' }
        ];
        
        // Find new level
        let newLevel = state.profile.level;
        let newTitle = state.profile.title;
        
        for (let i = levelThresholds.length - 1; i >= 0; i--) {
          if (newXp >= levelThresholds[i].xpRequired) {
            newLevel = levelThresholds[i].level;
            newTitle = levelThresholds[i].title;
            break;
          }
        }
        
        set((state) => ({
          profile: {
            ...state.profile,
            xp: newXp,
            level: newLevel,
            title: newTitle
          },
          stats: {
            ...state.stats,
            totalXpEarned: state.stats.totalXpEarned + amount
          }
        }));
        
        return newLevel > state.profile.level; // Returns true if leveled up
      },
      
      // Exercise Progress
      unlockExercise: (exerciseId) => set((state) => ({
        unlockedExercises: state.unlockedExercises.includes(exerciseId)
          ? state.unlockedExercises
          : [...state.unlockedExercises, exerciseId]
      })),
      
      masterExercise: (exerciseId) => set((state) => ({
        masteredExercises: state.masteredExercises.includes(exerciseId)
          ? state.masteredExercises
          : [...state.masteredExercises, exerciseId]
      })),
      
      updateExerciseProgress: (exerciseId, data) => set((state) => ({
        exerciseProgress: {
          ...state.exerciseProgress,
          [exerciseId]: {
            ...state.exerciseProgress[exerciseId],
            ...data,
            lastPerformed: new Date().toISOString()
          }
        }
      })),
      
      // Workout Actions
      completeWorkout: (workoutData) => {
        const state = get();
        const today = new Date().toDateString();
        const lastWorkout = state.lastWorkoutDate 
          ? new Date(state.lastWorkoutDate).toDateString()
          : null;
        
        // Calculate streak
        let newStreak = state.currentStreak;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastWorkout === yesterday.toDateString()) {
          newStreak += 1;
        } else if (lastWorkout !== today) {
          newStreak = 1;
        }
        
        set((state) => ({
          workoutHistory: [
            {
              ...workoutData,
              id: Date.now(),
              completedAt: new Date().toISOString()
            },
            ...state.workoutHistory
          ],
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, state.longestStreak),
          lastWorkoutDate: new Date().toISOString(),
          stats: {
            ...state.stats,
            totalWorkouts: state.stats.totalWorkouts + 1,
            totalReps: state.stats.totalReps + (workoutData.totalReps || 0),
            totalMinutes: state.stats.totalMinutes + (workoutData.duration || 0)
          }
        }));
      },
      
      // Achievements
      unlockAchievement: (achievementId) => set((state) => ({
        achievements: state.achievements.includes(achievementId)
          ? state.achievements
          : [...state.achievements, achievementId]
      })),
      
      // Get coach info
      getCoachInfo: () => {
        const style = get().profile.coachStyle || 'balanced';
        return AI_COACH_STYLES[style];
      },
      
      // Reset (for testing)
      reset: () => set(initialState)
    }),
    {
      name: 'flow-user-storage'
    }
  )
);

export { AI_COACH_STYLES };
