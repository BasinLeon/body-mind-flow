import { useState } from 'react';
import { useUserStore, AI_COACH_STYLES } from '../store/userStore';
import './Onboarding.css';

const SKILL_LEVELS = [
    {
        id: 'beginner',
        name: 'Beginner',
        icon: '🌱',
        description: 'New to bodyweight training or returning after a long break',
        tests: ['10 wall push-ups', '15s dead hang', '10 squats']
    },
    {
        id: 'intermediate',
        name: 'Intermediate',
        icon: '💪',
        description: 'Can do push-ups, pull-ups, and solid bodyweight basics',
        tests: ['15 push-ups', '5 pull-ups', '20 deep squats']
    },
    {
        id: 'advanced',
        name: 'Advanced',
        icon: '🔥',
        description: 'Working on skills like muscle-ups, planches, or pistols',
        tests: ['25 push-ups', '10+ pull-ups', 'L-sit hold']
    }
];

export default function Onboarding() {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [skillLevel, setSkillLevel] = useState(null);
    const [coachStyle, setCoachStyle] = useState('balanced');
    const [goals, setGoals] = useState([]);

    const { completeOnboarding, setCoachStyle: saveCoachStyle } = useUserStore();

    const GOALS = [
        { id: 'strength', label: 'Build Strength', icon: '💪' },
        { id: 'skills', label: 'Learn Skills', icon: '🎯' },
        { id: 'weight-loss', label: 'Lose Weight', icon: '⚡' },
        { id: 'flexibility', label: 'Improve Flexibility', icon: '🧘' },
        { id: 'consistency', label: 'Build Consistency', icon: '🔥' },
        { id: 'mindfulness', label: 'Mind-Body Connection', icon: '✨' }
    ];

    const toggleGoal = (goalId) => {
        setGoals(prev =>
            prev.includes(goalId)
                ? prev.filter(g => g !== goalId)
                : [...prev, goalId]
        );
    };

    const handleComplete = () => {
        completeOnboarding({
            name,
            skillLevel,
            coachStyle,
            goals
        });
        saveCoachStyle(coachStyle);
    };

    const canProceed = () => {
        if (step === 1) return name.trim().length >= 2;
        if (step === 2) return skillLevel !== null;
        if (step === 3) return goals.length > 0;
        if (step === 4) return true;
        return false;
    };

    return (
        <div className="onboarding">
            <div className="onboarding-container">
                {/* Progress Indicator */}
                <div className="onboarding-progress">
                    {[1, 2, 3, 4].map(s => (
                        <div
                            key={s}
                            className={`progress-dot ${s === step ? 'active' : ''} ${s < step ? 'complete' : ''}`}
                        />
                    ))}
                </div>

                {/* Step 1: Name */}
                {step === 1 && (
                    <div className="onboarding-step animate-fadeIn">
                        <div className="step-icon">🌟</div>
                        <h1>Welcome to <span className="text-gradient">FLOW</span></h1>
                        <p>Your journey to body, mind, and spirit mastery begins here.</p>

                        <div className="input-group">
                            <label>What should we call you?</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                autoFocus
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Skill Level */}
                {step === 2 && (
                    <div className="onboarding-step animate-fadeIn">
                        <div className="step-icon">📊</div>
                        <h2>What's your current level?</h2>
                        <p>This helps us personalize your experience. You can always adjust later.</p>

                        <div className="level-grid">
                            {SKILL_LEVELS.map(level => (
                                <button
                                    key={level.id}
                                    className={`level-card ${skillLevel === level.id ? 'selected' : ''}`}
                                    onClick={() => setSkillLevel(level.id)}
                                >
                                    <span className="level-icon">{level.icon}</span>
                                    <span className="level-name">{level.name}</span>
                                    <span className="level-desc">{level.description}</span>
                                    <div className="level-tests">
                                        {level.tests.map((test, i) => (
                                            <span key={i} className="test-badge">{test}</span>
                                        ))}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Goals */}
                {step === 3 && (
                    <div className="onboarding-step animate-fadeIn">
                        <div className="step-icon">🎯</div>
                        <h2>What are your goals?</h2>
                        <p>Select all that apply. We'll tailor your experience.</p>

                        <div className="goals-grid">
                            {GOALS.map(goal => (
                                <button
                                    key={goal.id}
                                    className={`goal-card ${goals.includes(goal.id) ? 'selected' : ''}`}
                                    onClick={() => toggleGoal(goal.id)}
                                >
                                    <span className="goal-icon">{goal.icon}</span>
                                    <span className="goal-label">{goal.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: Coach Style */}
                {step === 4 && (
                    <div className="onboarding-step animate-fadeIn">
                        <div className="step-icon">🤖</div>
                        <h2>Choose your AI Coach</h2>
                        <p>Pick the coaching style that motivates you best.</p>

                        <div className="coach-grid">
                            {Object.values(AI_COACH_STYLES).map(coach => (
                                <button
                                    key={coach.id}
                                    className={`coach-card ${coachStyle === coach.id ? 'selected' : ''}`}
                                    onClick={() => setCoachStyle(coach.id)}
                                >
                                    <span className="coach-icon">{coach.icon}</span>
                                    <span className="coach-name">{coach.name}</span>
                                    <span className="coach-desc">{coach.description}</span>
                                    <span className="coach-greeting">"{coach.greeting}"</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="onboarding-nav">
                    {step > 1 && (
                        <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>
                            Back
                        </button>
                    )}

                    {step < 4 ? (
                        <button
                            className="btn btn-primary"
                            onClick={() => setStep(s => s + 1)}
                            disabled={!canProceed()}
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handleComplete}
                        >
                            Begin Your Journey ✨
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
