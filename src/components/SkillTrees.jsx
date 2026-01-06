import { useState, useMemo } from 'react';
import { useUserStore } from '../store/userStore';
import progressionData from '../data/progressions.json';
import exerciseData from '../data/exercises.json';
import './SkillTrees.css';

export default function SkillTrees() {
    const [activeTree, setActiveTree] = useState(progressionData.skillTrees[0].id);
    const [selectedNode, setSelectedNode] = useState(null);
    const [showUnlockAnimation, setShowUnlockAnimation] = useState(null);

    const { unlockedExercises, exerciseProgress, unlockExercise } = useUserStore();

    const currentTree = useMemo(() =>
        progressionData.skillTrees.find(t => t.id === activeTree),
        [activeTree]
    );

    // Calculate node states
    const getNodeState = (node) => {
        const isUnlocked = unlockedExercises.includes(node.exerciseId);
        const isMastered = false; // Would check exerciseProgress for mastery

        // Check if prerequisites are met
        let canUnlock = false;
        if (!node.unlockRequirements) {
            canUnlock = true;
        } else {
            const prereqUnlocked = unlockedExercises.includes(node.unlockRequirements.exerciseId);
            canUnlock = prereqUnlocked && !isUnlocked;
        }

        return {
            isUnlocked,
            isMastered,
            canUnlock,
            isLocked: !isUnlocked && !canUnlock
        };
    };

    const handleNodeClick = (node) => {
        const exercise = exerciseData.exercises.find(e => e.id === node.exerciseId);
        const state = getNodeState(node);
        setSelectedNode({ ...node, exercise, state });
    };

    const handleUnlock = (node) => {
        unlockExercise(node.exerciseId);
        setShowUnlockAnimation(node.exerciseId);
        setTimeout(() => setShowUnlockAnimation(null), 1500);

        // Update selected node state
        if (selectedNode && selectedNode.exerciseId === node.exerciseId) {
            const exercise = exerciseData.exercises.find(e => e.id === node.exerciseId);
            setSelectedNode({ ...node, exercise, state: getNodeState(node) });
        }
    };

    // Calculate progress for current tree
    const treeProgress = useMemo(() => {
        if (!currentTree) return { unlocked: 0, total: 0 };
        const unlocked = currentTree.nodes.filter(n => unlockedExercises.includes(n.exerciseId)).length;
        return { unlocked, total: currentTree.nodes.length };
    }, [currentTree, unlockedExercises]);

    return (
        <div className="skill-trees">
            {/* Tree Selector */}
            <div className="tree-selector">
                {progressionData.skillTrees.map(tree => {
                    const progress = tree.nodes.filter(n => unlockedExercises.includes(n.exerciseId)).length;
                    const isActive = activeTree === tree.id;

                    return (
                        <button
                            key={tree.id}
                            className={`tree-tab ${isActive ? 'active' : ''}`}
                            onClick={() => setActiveTree(tree.id)}
                            style={{ '--tree-color': tree.color }}
                        >
                            <span className="tree-icon">{tree.icon}</span>
                            <div className="tree-info">
                                <span className="tree-name">{tree.name}</span>
                                <span className="tree-progress">{progress}/{tree.nodes.length}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Tree Header */}
            <div className="tree-header" style={{ '--tree-color': currentTree?.color }}>
                <div className="tree-title">
                    <span className="tree-icon-large">{currentTree?.icon}</span>
                    <div>
                        <h1>{currentTree?.name}</h1>
                        <p>{currentTree?.description}</p>
                    </div>
                </div>
                <div className="tree-progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${(treeProgress.unlocked / treeProgress.total) * 100}%` }}
                    />
                    <span className="progress-text">
                        {treeProgress.unlocked} / {treeProgress.total} Unlocked
                    </span>
                </div>
            </div>

            {/* Skill Tree Graph */}
            <div className="tree-graph">
                <div className="graph-container">
                    {/* Connection Lines */}
                    <svg className="connection-lines" viewBox="0 0 800 150">
                        {currentTree?.nodes.slice(1).map((node, i) => {
                            const startX = 80 + (node.position.x - 1) * 130;
                            const endX = 80 + node.position.x * 130;
                            const y = 75;
                            const prevNode = currentTree.nodes[i];
                            const state = getNodeState(node);
                            const prevState = getNodeState(prevNode);

                            return (
                                <line
                                    key={node.exerciseId}
                                    x1={startX}
                                    y1={y}
                                    x2={endX}
                                    y2={y}
                                    className={`connection ${state.isUnlocked || prevState.isUnlocked ? 'active' : ''}`}
                                    style={{ stroke: currentTree.color }}
                                />
                            );
                        })}
                    </svg>

                    {/* Nodes */}
                    <div className="nodes-container">
                        {currentTree?.nodes.map((node, index) => {
                            const exercise = exerciseData.exercises.find(e => e.id === node.exerciseId);
                            const state = getNodeState(node);
                            const isAnimating = showUnlockAnimation === node.exerciseId;

                            return (
                                <div
                                    key={node.exerciseId}
                                    className={`skill-node ${state.isUnlocked ? 'unlocked' : ''} ${state.canUnlock ? 'can-unlock' : ''} ${state.isLocked ? 'locked' : ''} ${state.isMastered ? 'mastered' : ''} ${isAnimating ? 'unlocking' : ''}`}
                                    style={{
                                        left: `${80 + node.position.x * 130}px`,
                                        '--node-color': currentTree.color
                                    }}
                                    onClick={() => handleNodeClick(node)}
                                >
                                    <div className="node-glow" />
                                    <div className="node-ring" />
                                    <div className="node-inner">
                                        {state.isLocked ? (
                                            <span className="lock-icon">🔒</span>
                                        ) : (
                                            <span className="node-emoji">{exercise?.name.split(' ')[0].substring(0, 2).toUpperCase()}</span>
                                        )}
                                    </div>
                                    {isAnimating && <div className="unlock-burst" />}
                                    <span className="node-label">{exercise?.name}</span>
                                    {state.canUnlock && <span className="unlock-indicator">TAP</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Selected Node Detail */}
            {selectedNode && (
                <div className="node-detail card" style={{ '--tree-color': currentTree?.color }}>
                    <div className="detail-header">
                        <div className="detail-status">
                            {selectedNode.state.isUnlocked && <span className="status-badge unlocked">✓ Unlocked</span>}
                            {selectedNode.state.canUnlock && <span className="status-badge available">Available</span>}
                            {selectedNode.state.isLocked && <span className="status-badge locked">🔒 Locked</span>}
                        </div>
                        <button className="close-btn" onClick={() => setSelectedNode(null)}>✕</button>
                    </div>

                    <h2>{selectedNode.exercise?.name}</h2>
                    <p className="detail-description">{selectedNode.exercise?.description}</p>

                    {/* Unlock Requirements */}
                    {selectedNode.unlockRequirements && (
                        <div className="requirements-section">
                            <h4>Requirements</h4>
                            <div className="requirement-item">
                                <span className="req-icon">📋</span>
                                <span>
                                    Master {exerciseData.exercises.find(e => e.id === selectedNode.unlockRequirements.exerciseId)?.name}
                                </span>
                            </div>
                            {selectedNode.unlockRequirements.reps && (
                                <div className="requirement-item">
                                    <span className="req-icon">🔄</span>
                                    <span>{selectedNode.unlockRequirements.reps} reps × {selectedNode.unlockRequirements.sets} sets</span>
                                </div>
                            )}
                            {selectedNode.unlockRequirements.seconds && (
                                <div className="requirement-item">
                                    <span className="req-icon">⏱️</span>
                                    <span>{selectedNode.unlockRequirements.seconds}s hold × {selectedNode.unlockRequirements.sets} sets</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="detail-actions">
                        {selectedNode.state.canUnlock && (
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={() => handleUnlock(selectedNode)}
                            >
                                ✨ Unlock Exercise
                            </button>
                        )}
                        {selectedNode.state.isUnlocked && (
                            <button className="btn btn-secondary">
                                View Exercise →
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
