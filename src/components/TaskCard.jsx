import React from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const calculateBandScore = (percentage) => {
    if (percentage >= 89) return 9.0;
    if (percentage >= 84) return 8.5;
    if (percentage >= 78) return 8.0;
    if (percentage >= 73) return 7.5;
    if (percentage >= 67) return 7.0;
    if (percentage >= 60) return 6.5;
    if (percentage >= 53) return 6.0;
    if (percentage >= 47) return 5.5;
    if (percentage >= 40) return 5.0;
    if (percentage >= 33) return 4.5;
    if (percentage >= 27) return 4.0;
    if (percentage >= 20) return 3.5;
    if (percentage >= 13) return 3.0;
    return 0;
};

const TaskCard = ({
    task,
    index,
    dayColor,
    skill,
    userMode,
    selectedStudent,
    onUpdateTask,
    onDeleteTask,
    onUpdateScore
}) => {
    const maxScore = task.maxScore || 40;
    const studentScore = selectedStudent?.scores?.[task.id] || 0;
    const percentage = maxScore > 0 ? (studentScore / maxScore) * 100 : 0;
    const bandScore = calculateBandScore(percentage);

    const getColorClass = (pct) => {
        if (pct >= 78) return 'excellent';
        if (pct >= 60) return 'good';
        if (pct >= 40) return 'average';
        if (pct > 0) return 'low';
        return 'none';
    };

    const colorClass = getColorClass(percentage);


    return (
        <div className={`task-card glass-card ${colorClass} group`}>
            <div className="task-content flex items-center gap-4">
                {/* Task Number */}
                <div className={`task-number ${dayColor} font-serif`}>
                    {index + 1}
                </div>

                {/* Task Icon */}
                <div className={`task-icon ${colorClass}`}>
                    {percentage >= 60 ? (
                        <CheckCircleIcon sx={{ fontSize: 24, color: '#10b981' }} />
                    ) : studentScore > 0 ? (
                        <TrendingUpIcon sx={{ fontSize: 24, color: '#f59e0b' }} />
                    ) : (
                        <RadioButtonUncheckedIcon sx={{ fontSize: 24, color: '#475569' }} />
                    )}
                </div>

                {/* Task Info */}
                <div className="task-info flex-1">
                    <div className="flex items-center gap-3">
                        {userMode === 'teacher' ? (
                            <input
                                type="text"
                                value={task.title}
                                onChange={(e) => onUpdateTask({ ...task, title: e.target.value })}
                                className="task-title-input glass-input font-serif text-lg w-full"
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 0,
                                    padding: '4px 0',
                                    color: '#fff'
                                }}
                                placeholder="Enter task title..."
                            />
                        ) : (
                            <h4 className="task-title font-serif text-lg text-white">{task.title || "No Title"}</h4>
                        )}

                        {/* Deadline Tag */}
                        {task.deadline && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 border border-slate-700">
                                <AccessTimeIcon sx={{ fontSize: 12 }} />
                                {task.deadline}
                            </div>
                        )}
                    </div>

                    <p className="task-meta text-xs text-zinc-500 uppercase tracking-wider mt-1 font-medium">
                        {skill} • Task #{index + 1}
                        {userMode === 'teacher' && task.date && ` • ${task.date.substring(0, 10)}`}
                    </p>
                </div>

                {/* Scoring Section */}
                <div className="task-scoring flex items-center gap-6">
                    {/* Score Input/Display */}
                    <div className="score-box flex flex-col items-center">
                        <span className="score-label text-[10px] uppercase text-zinc-600 font-bold mb-1">Score</span>
                        {userMode === 'teacher' && selectedStudent ? (
                            <div className="score-input-group flex items-center bg-black/20 rounded-lg p-1 border border-white/5">
                                <input
                                    type="number"
                                    value={studentScore}
                                    onChange={(e) => {
                                        const val = Math.min(maxScore, Math.max(0, Number(e.target.value)));
                                        onUpdateScore(val);
                                    }}
                                    min="0"
                                    max={maxScore}
                                    className="score-input bg-transparent text-white text-center w-10 font-bold outline-none"
                                />
                                <span className="score-divider text-zinc-600 text-sm">/</span>
                                <input
                                    type="number"
                                    value={maxScore}
                                    onChange={(e) => {
                                        const val = Math.min(100, Math.max(1, Number(e.target.value)));
                                        onUpdateTask({ ...task, maxScore: val });
                                    }}
                                    min="1"
                                    max="100"
                                    className="max-input bg-transparent text-zinc-500 text-center w-10 text-xs outline-none"
                                />
                            </div>
                        ) : (
                            <div className={`score-display ${colorClass} font-mono text-lg font-bold`}>
                                <span className={studentScore > 0 ? 'text-white' : 'text-zinc-600'}>
                                    {studentScore > 0 ? studentScore : '—'}
                                </span>
                                <span className="text-zinc-600 text-sm">/{maxScore}</span>
                            </div>
                        )}
                    </div>

                    {/* Band Score */}
                    <div className="band-box flex flex-col items-center min-w-[50px]">
                        <span className="band-label text-[10px] uppercase text-zinc-600 font-bold mb-1">Band</span>
                        <div className={`band-display text-xl font-bold font-serif ${studentScore > 0 ? 'text-amber-500' : 'text-zinc-700'}`}>
                            {studentScore > 0 ? bandScore.toFixed(1) : '—'}
                        </div>
                    </div>

                    {/* Delete (Teacher Only) */}
                    {userMode === 'teacher' && (
                        <button
                            onClick={onDeleteTask}
                            className="btn-delete opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-900/50 hover:text-red-500 hover:bg-red-500/10 rounded-full"
                            title="Delete"
                        >
                            <DeleteIcon sx={{ fontSize: 20 }} />
                        </button>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="task-progress mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className={`progress-fill h-full transition-all duration-500 ${colorClass === 'excellent' ? 'bg-emerald-500' : colorClass === 'good' ? 'bg-blue-500' : colorClass === 'average' ? 'bg-amber-500' : 'bg-zinc-700'}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export default TaskCard;
