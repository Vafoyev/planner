import React, { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

const TaskCard = ({
    task,
    index,
    dayColor,
    skill,
    userMode,
    selectedStudent,
    studentScore = 0,
    onUpdateTask,
    onDeleteTask,
    onUpdateScore
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editMaxScore, setEditMaxScore] = useState(task.maxScore);
    const [scoreInput, setScoreInput] = useState(studentScore || '');
    const [isGrading, setIsGrading] = useState(false);

    const handleSave = () => {
        onUpdateTask({
            ...task,
            title: editTitle,
            maxScore: parseInt(editMaxScore) || task.maxScore
        });
        setIsEditing(false);
    };

    const handleGrade = () => {
        const score = parseInt(scoreInput);
        if (score >= 0 && score <= task.maxScore) {
            onUpdateScore(score);
            setIsGrading(false);
        }
    };

    const getScoreColor = () => {
        if (!studentScore) return 'text-zinc-500';
        const percentage = (studentScore / task.maxScore) * 100;
        if (percentage >= 80) return 'text-emerald-400';
        if (percentage >= 60) return 'text-blue-400';
        if (percentage >= 40) return 'text-amber-400';
        return 'text-red-400';
    };

    const getScoreBg = () => {
        if (!studentScore) return 'bg-zinc-500/10';
        const percentage = (studentScore / task.maxScore) * 100;
        if (percentage >= 80) return 'bg-emerald-500/10';
        if (percentage >= 60) return 'bg-blue-500/10';
        if (percentage >= 40) return 'bg-amber-500/10';
        return 'bg-red-500/10';
    };

    // Format deadline
    const formatDeadline = () => {
        if (task.deadlineDate) {
            const date = new Date(task.deadlineDate);
            return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${task.deadline || '18:00'}`;
        }
        return task.deadline || 'No deadline';
    };

    return (
        <div className={`task-card group relative ${studentScore > 0 ? 'border-l-emerald-500' : ''}`}>
            {/* Task Number Badge */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {index + 1}
            </div>

            <div className="flex items-start gap-4">
                {/* Left: Task Info */}
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="glass-input w-full"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-zinc-500">Max Score:</span>
                                    <input
                                        type="number"
                                        value={editMaxScore}
                                        onChange={(e) => setEditMaxScore(e.target.value)}
                                        className="glass-input w-20 text-center"
                                        min="1"
                                        max="100"
                                    />
                                </div>
                                <button onClick={handleSave} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm flex items-center gap-1 hover:bg-emerald-500/30">
                                    <SaveIcon sx={{ fontSize: 14 }} />
                                    Save
                                </button>
                                <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 bg-white/5 text-zinc-400 rounded-lg text-sm hover:bg-white/10">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h4 className="text-lg font-medium text-white mb-2 group-hover:text-amber-400 transition-colors">
                                {task.title}
                            </h4>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1.5 text-zinc-400">
                                    <AccessTimeIcon sx={{ fontSize: 14 }} />
                                    {formatDeadline()}
                                </span>
                                <span className="flex items-center gap-1.5 text-amber-500">
                                    <StarIcon sx={{ fontSize: 14 }} />
                                    {task.maxScore} points
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-white/5 rounded text-zinc-500">
                                    {skill}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Right: Score / Actions */}
                <div className="flex items-center gap-3">
                    {/* Score Display */}
                    {selectedStudent && userMode === 'teacher' && (
                        <div className="flex items-center gap-2">
                            {isGrading ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={scoreInput}
                                        onChange={(e) => setScoreInput(e.target.value)}
                                        className="glass-input w-16 text-center py-1"
                                        min="0"
                                        max={task.maxScore}
                                        autoFocus
                                    />
                                    <span className="text-zinc-500">/ {task.maxScore}</span>
                                    <button
                                        onClick={handleGrade}
                                        className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30"
                                    >
                                        <SaveIcon sx={{ fontSize: 16 }} />
                                    </button>
                                    <button
                                        onClick={() => setIsGrading(false)}
                                        className="p-1.5 bg-white/5 text-zinc-400 rounded hover:bg-white/10"
                                    >
                                        <CloseIcon sx={{ fontSize: 16 }} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        setScoreInput(studentScore || '');
                                        setIsGrading(true);
                                    }}
                                    className={`px-4 py-2 rounded-lg ${getScoreBg()} ${getScoreColor()} font-semibold flex items-center gap-2 hover:ring-2 hover:ring-white/20 transition-all`}
                                >
                                    {studentScore > 0 ? (
                                        <>
                                            <CheckCircleIcon sx={{ fontSize: 16 }} />
                                            {studentScore}/{task.maxScore}
                                        </>
                                    ) : (
                                        <>
                                            <PendingIcon sx={{ fontSize: 16 }} />
                                            Grade
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Student View - Show Score */}
                    {userMode === 'student' && (
                        <div className={`px-4 py-2 rounded-lg ${getScoreBg()} ${getScoreColor()} font-semibold flex items-center gap-2`}>
                            {studentScore > 0 ? (
                                <>
                                    <CheckCircleIcon sx={{ fontSize: 16 }} />
                                    {studentScore}/{task.maxScore}
                                </>
                            ) : (
                                <>
                                    <PendingIcon sx={{ fontSize: 16 }} />
                                    Pending
                                </>
                            )}
                        </div>
                    )}

                    {/* Teacher Actions */}
                    {userMode === 'teacher' && !isEditing && !isGrading && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-amber-400"
                                title="Edit Task"
                            >
                                <EditIcon sx={{ fontSize: 18 }} />
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm('Delete this task?')) {
                                        onDeleteTask();
                                    }
                                }}
                                className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-400"
                                title="Delete Task"
                            >
                                <DeleteIcon sx={{ fontSize: 18 }} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Bar for graded tasks */}
            {studentScore > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-zinc-500">Score Progress</span>
                        <span className={getScoreColor()}>
                            {Math.round((studentScore / task.maxScore) * 100)}%
                        </span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${(studentScore / task.maxScore) * 100}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskCard;
