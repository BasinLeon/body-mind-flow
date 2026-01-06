import { useState, useRef, useEffect } from 'react';
import { useUserStore, AI_COACH_STYLES } from '../store/userStore';
import './AICoach.css';

// Ollama API endpoint
const OLLAMA_API = 'http://localhost:11434/api/generate';

export default function AICoach({ isOpen, onClose }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [ollamaAvailable, setOllamaAvailable] = useState(null);
    const messagesEndRef = useRef(null);

    const { profile, getCoachInfo } = useUserStore();
    const coach = getCoachInfo();

    // Check Ollama availability
    useEffect(() => {
        checkOllama();
    }, []);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Add welcome message on open
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                role: 'assistant',
                content: coach.greeting,
                timestamp: new Date()
            }]);
        }
    }, [isOpen, coach.greeting]);

    const checkOllama = async () => {
        try {
            const response = await fetch('http://localhost:11434/api/tags');
            if (response.ok) {
                setOllamaAvailable(true);
            } else {
                setOllamaAvailable(false);
            }
        } catch {
            setOllamaAvailable(false);
        }
    };

    const buildSystemPrompt = () => {
        const styleGuide = {
            mentor: `You are a wise, calm fitness mentor. Speak with philosophical depth and patience. 
Use metaphors about the journey of mastery. Keep responses concise but meaningful.`,
            hype: `You are a HIGH ENERGY fitness coach! Use caps, exclamation marks, and motivational language.
Be enthusiastic and pump up the user. Keep it positive and ACTION-ORIENTED!`,
            balanced: `You are a supportive, adaptive fitness guide. Match the user's energy.
Be practical and encouraging. Focus on sustainable progress.`
        };

        return `${styleGuide[profile.coachStyle] || styleGuide.balanced}

You are the AI coach for FLOW, a calisthenics training app focused on bodyweight mastery and mind-body connection.

User context:
- Name: ${profile.name}
- Level: ${profile.level} (${profile.title})
- XP: ${profile.xp}
- Goals: ${profile.goals?.join(', ') || 'Not specified'}
- Skill Level: ${profile.skillLevel || 'Beginner'}

Key areas you can help with:
1. Form tips and technique guidance
2. Progression advice (what exercise to work toward next)
3. Motivation and mindset
4. Recovery and rest day guidance
5. Breathwork and mind-body connection

Keep responses concise (2-4 sentences typically). Be specific and actionable.
Reference the user's level and goals when relevant.`;
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // If Ollama is available, use it
        if (ollamaAvailable) {
            try {
                const response = await fetch(OLLAMA_API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'llama3.2',
                        prompt: `${buildSystemPrompt()}\n\nUser: ${userMessage.content}\n\nAssistant:`,
                        stream: false,
                        options: {
                            temperature: 0.7,
                            num_predict: 150
                        }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: data.response.trim(),
                        timestamp: new Date()
                    }]);
                } else {
                    throw new Error('Ollama request failed');
                }
            } catch (error) {
                // Fallback to built-in responses
                const fallbackResponse = generateFallbackResponse(userMessage.content);
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: fallbackResponse,
                    timestamp: new Date()
                }]);
            }
        } else {
            // Use built-in responses
            await new Promise(r => setTimeout(r, 500)); // Simulate thinking
            const response = generateFallbackResponse(userMessage.content);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response,
                timestamp: new Date()
            }]);
        }

        setIsLoading(false);
    };

    const generateFallbackResponse = (userInput) => {
        const input = userInput.toLowerCase();
        const style = profile.coachStyle || 'balanced';

        // Context-aware responses
        if (input.includes('push-up') || input.includes('pushup')) {
            const responses = {
                mentor: "The push-up is a foundation—master it before seeking complexity. Focus on the scapulae retracting, the core engaged like steel. Your body is one unit.",
                hype: "Push-ups are KING! 💪 Lock in that core, squeeze those shoulder blades, and OWN each rep! You've got this!",
                balanced: "Great question! For push-ups, focus on keeping your body in a straight line. Engage your core and control the descent. Quality over quantity."
            };
            return responses[style];
        }

        if (input.includes('pull-up') || input.includes('pullup')) {
            const responses = {
                mentor: "The pull-up teaches us to defy gravity through patient strength. Begin with dead hangs, progress to scap pulls. Trust the process.",
                hype: "Pull-ups are the ULTIMATE test! Start with negatives, work those scap pulls, and you'll be crushing reps in no time! LET'S GO!",
                balanced: "Pull-ups take time to develop. Start with dead hangs, then scapular pulls, then negatives. Consistency is key—you'll get there."
            };
            return responses[style];
        }

        if (input.includes('progress') || input.includes('next') || input.includes('advance')) {
            const responses = {
                mentor: `At level ${profile.level}, you're building the foundation of true strength. Don't rush the journey—master what you have before seeking the next peak.`,
                hype: `Level ${profile.level}?! You're just warming up! Focus on unlocking those skill tree nodes and CRUSHING your current exercises. The next level is YOURS!`,
                balanced: `Based on your level ${profile.level} progress, I'd suggest mastering your current unlocked exercises before moving forward. Check the Skill Trees for your next milestone.`
            };
            return responses[style];
        }

        if (input.includes('rest') || input.includes('recover')) {
            const responses = {
                mentor: "Rest is not weakness—it is where strength is forged. Honor your body's need for recovery. The wise warrior knows when to retreat.",
                hype: "Recovery is when the MAGIC happens! Sleep well, stretch, and come back STRONGER! Your body is building muscle RIGHT NOW!",
                balanced: "Rest days are crucial. Try light stretching, a walk, or some mobility work. Your muscles grow during recovery, not during the workout."
            };
            return responses[style];
        }

        if (input.includes('motivation') || input.includes('stuck') || input.includes('hard')) {
            const responses = {
                mentor: "Every master was once a disaster. The path is not linear—there will be valleys. But you are still moving. That is all that matters.",
                hype: "LISTEN UP! 🔥 You didn't come this far to ONLY come this far! One rep at a time, one day at a time. You ARE making progress!",
                balanced: "It's normal to feel stuck sometimes. Try focusing on one small goal for today. Progress is often invisible until suddenly it's not."
            };
            return responses[style];
        }

        if (input.includes('breath') || input.includes('breathe') || input.includes('flow')) {
            const responses = {
                mentor: "Breath is the bridge between body and mind. Inhale on the eccentric, exhale on the exertion. Let breath guide movement, not chase it.",
                hype: "Breathwork is your SECRET WEAPON! Big inhale on the way down, POWER exhale on the push! Stay in the ZONE!",
                balanced: "Good breathing improves performance: breathe in during the easier phase, breathe out during exertion. Try to stay relaxed—tension wastes energy."
            };
            return responses[style];
        }

        // Default encouragement
        const encouragements = coach.encouragement;
        return encouragements[Math.floor(Math.random() * encouragements.length)];
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const quickActions = [
        { label: 'Form tips', prompt: 'What are the key form tips I should remember?' },
        { label: 'What next?', prompt: 'What should I work on next based on my progress?' },
        { label: 'Motivation', prompt: "I'm feeling stuck. Can you help motivate me?" },
        { label: 'Breathwork', prompt: 'How should I breathe during exercises?' }
    ];

    if (!isOpen) return null;

    return (
        <div className="ai-coach-overlay" onClick={onClose}>
            <div className="ai-coach-panel" onClick={e => e.stopPropagation()}>
                <div className="coach-header">
                    <div className="coach-identity">
                        <span className="coach-avatar">{coach.icon}</span>
                        <div>
                            <h3>{coach.name}</h3>
                            <span className="coach-status">
                                {ollamaAvailable === true && '🟢 AI Connected'}
                                {ollamaAvailable === false && '🟡 Local Mode'}
                                {ollamaAvailable === null && '⏳ Checking...'}
                            </span>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="coach-messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`message ${msg.role}`}>
                            {msg.role === 'assistant' && (
                                <span className="message-avatar">{coach.icon}</span>
                            )}
                            <div className="message-content">
                                <p>{msg.content}</p>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="message assistant">
                            <span className="message-avatar">{coach.icon}</span>
                            <div className="message-content loading">
                                <span className="typing-dot" />
                                <span className="typing-dot" />
                                <span className="typing-dot" />
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div className="quick-actions">
                    {quickActions.map((action, i) => (
                        <button
                            key={i}
                            className="quick-action"
                            onClick={() => {
                                setInput(action.prompt);
                            }}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>

                <div className="coach-input">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask your coach anything..."
                        rows={1}
                    />
                    <button
                        className="send-btn"
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                    >
                        →
                    </button>
                </div>
            </div>
        </div>
    );
}
