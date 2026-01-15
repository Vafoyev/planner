import React, { useState, useMemo } from 'react';
import TaskCard from './TaskCard';
import {
    format,
    startOfWeek,
    addDays,
    addWeeks,
    subWeeks,
    isSameDay,
    parseISO
} from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import EditNoteIcon from '@mui/icons-material/EditNote';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import QuizIcon from '@mui/icons-material/Quiz';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DAY_INFO = {
    Monday: { skill: 'Listening', icon: HeadphonesIcon, color: 'purple' },
    Tuesday: { skill: 'Reading', icon: AutoStoriesIcon, color: 'blue' },
    Wednesday: { skill: 'Writing', icon: EditNoteIcon, color: 'green' },
    Thursday: { skill: 'Speaking', icon: RecordVoiceOverIcon, color: 'orange' },
    Friday: { skill: 'Mock Test', icon: QuizIcon, color: 'pink' },
    Saturday: { skill: 'Speaking Practice', icon: RecordVoiceOverIcon, color: 'teal' },
    Sunday: { skill: 'Review', icon: EmojiEventsIcon, color: 'indigo' },
};

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

const ScheduleView = ({
    tasks,
    students,
    selectedStudent,
    onUpdateTask,
    onAddTask,
    onDeleteTask,
    onUpdateScore,
    userMode
}) => {
    // Week State
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [selectedDayIndex, setSelectedDayIndex] = useState(0); // 0 = Mon, 4 = Fri
    const [isAdding, setIsAdding] = useState(false);

    // Add Task State
    const [newTitle, setNewTitle] = useState('');
    const [newMaxScore, setNewMaxScore] = useState(40);
    const [newDeadline, setNewDeadline] = useState('18:00'); // Default deadline

    // Memos
    const weekDates = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));
    }, [currentWeekStart]);

    const selectedDate = weekDates[selectedDayIndex];
    const selectedDayName = format(selectedDate, 'EEEE'); // "Monday"

    // NOTE: We map real dates back to "Monday" keys for simple storage compatibility 
    // In a real DB app, we'd query by date range.
    const currentTasks = tasks[selectedDayName] || [];

    const DayIcon = DAY_INFO[selectedDayName]?.icon || CalendarTodayIcon;
    const daySkill = DAY_INFO[selectedDayName]?.skill || 'General';
    const dayColor = DAY_INFO[selectedDayName]?.color || 'blue';

    // Calculate stats for selected student (if any)
    const getStudentStats = () => {
        if (!selectedStudent) return { earned: 0, max: 0, band: 0, graded: 0 };

        let earned = 0, max = 0, graded = 0;
        currentTasks.forEach(task => {
            max += task.maxScore;
            const score = selectedStudent.scores?.[task.id] || 0;
            if (score > 0) {
                earned += score;
                graded++;
            }
        });
        const pct = max > 0 ? (earned / max) * 100 : 0;
        return { earned, max, band: calculateBandScore(pct), graded, pct };
    };

    const stats = getStudentStats();

    const handleAdd = () => {
        if (newTitle.trim()) {
            onAddTask(selectedDayName, {
                title: newTitle.trim(),
                maxScore: parseInt(newMaxScore) || 40,
                deadline: newDeadline,
                date: selectedDate.toISOString() // Store ISO date for future proofing
            });
            setNewTitle('');
            setNewMaxScore(40);
            setIsAdding(false);
        }
    };

    const handleNavigateWeek = (direction) => {
        setCurrentWeekStart(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
    };

    return (
        <div className="schedule-view pb-12">
            {/* Header / Week Navigator */}
            <header className="page-glass-header mb-8 justify-between">
                <div className="flex items-center gap-4">
                    <div className="header-icon-glass">
                        <CalendarTodayIcon sx={{ fontSize: 24, color: '#f59e0b' }} />
                    </div>
                    <div>
                        <h2 className="text-2xl">Weekly Schedule</h2>
                        <p className="text-secondary text-sm font-sans opacity-70">
                            {format(currentWeekStart, 'MMMM d')} - {format(addDays(currentWeekStart, 4), 'MMMM d, yyyy')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-black/20 rounded-full p-1 border border-white/5">
                    <button onClick={() => handleNavigateWeek('prev')} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
                        <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
                    </button>
                    <span className="text-sm font-medium px-2 min-w-[80px] text-center">
                        {isSameDay(currentWeekStart, startOfWeek(new Date(), { weekStartsOn: 1 })) ? 'Current' : 'Week ' + format(currentWeekStart, 'w')}
                    </span>
                    <button onClick={() => handleNavigateWeek('next')} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
                        <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
                    </button>
                </div>
            </header>

            {/* Pro Day Tabs */}
            <div className="day-tabs-container mb-8 grid grid-cols-7 gap-4">
                {weekDates.map((date, index) => {
                    const dayName = format(date, 'EEEE');
                    const info = DAY_INFO[dayName];
                    const isActive = selectedDayIndex === index;

                    return (
                        <div
                            key={dayName}
                            onClick={() => setSelectedDayIndex(index)}
                            className={`
                                cursor-pointer rounded-xl p-4 transition-all duration-300 border
                                ${isActive
                                    ? 'bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border-amber-500/50 shadow-lg shadow-amber-900/20 transform -translate-y-1'
                                    : 'bg-slate-800/30 border-white/5 hover:bg-slate-800/50 hover:border-white/10'
                                }
                            `}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <span className={`text-xs font-semibold tracking-wider uppercase ${isActive ? 'text-amber-400' : 'text-zinc-500'}`}>
                                    {dayName.substring(0, 3)}
                                </span>
                                <span className={`text-xl font-serif font-bold ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                                    {format(date, 'd')}
                                </span>
                                <span className="text-[10px] text-zinc-500 mt-1">{info.skill}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Area */}
            <div className="glass-panel p-8 min-h-[500px] relative overflow-visible">
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-${dayColor}-500/20 text-${dayColor}-400 ring-1 ring-${dayColor}-500/30`}>
                            <DayIcon sx={{ fontSize: 24 }} />
                        </div>
                        <div>
                            <h3 className="text-xl font-serif text-white">{selectedDayName} Plan</h3>
                            <p className="text-sm text-zinc-400 font-sans mt-0.5">
                                {format(selectedDate, 'MMMM do')} • {currentTasks.length} tasks
                            </p>
                        </div>
                    </div>

                    {/* Student Stats (Revised) */}
                    {userMode === 'teacher' && selectedStudent && (
                        <div className="flex items-center gap-4 bg-black/20 px-4 py-2 rounded-lg border border-white/5">
                            <span className="text-sm text-zinc-300">{selectedStudent.name}</span>
                            <div className={`px-3 py-1 rounded-md text-xs font-bold ${stats.band >= 6 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                Band {stats.band > 0 ? stats.band.toFixed(1) : '-'}
                            </div>
                        </div>
                    )}
                </div>

                {/* Add Task Panel */}
                {isAdding && (
                    <div className="mb-6 bg-slate-800/50 p-6 rounded-xl border border-amber-500/20 animation-slide-down">
                        <h4 className="text-amber-500 mb-4 font-medium flex items-center gap-2 text-sm uppercase tracking-wide">
                            <AddIcon sx={{ fontSize: 16 }} />
                            New Assignment
                        </h4>
                        <div className="flex gap-4 flex-wrap">
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAdd();
                                    if (e.key === 'Escape') setIsAdding(false);
                                }}
                                placeholder="Task title (e.g., Reading Part 1)..."
                                autoFocus
                                className="glass-input flex-1 min-w-[200px]"
                            />

                            {/* Deadline Input */}
                            <div className="flex items-center gap-2 glass-input px-3">
                                <AccessTimeIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                                <input
                                    type="time"
                                    value={newDeadline}
                                    onChange={(e) => setNewDeadline(e.target.value)}
                                    className="bg-transparent border-none outline-none text-white text-sm font-sans w-24"
                                />
                            </div>

                            <div className="flex items-center gap-2 bg-black/20 rounded-xl px-3 border border-white/10 h-[42px]">
                                <span className="text-zinc-500 text-xs uppercase font-bold">Max</span>
                                <input
                                    type="number"
                                    value={newMaxScore}
                                    onChange={(e) => setNewMaxScore(e.target.value)}
                                    min="1"
                                    max="100"
                                    className="bg-transparent text-white w-12 text-center outline-none font-medium"
                                />
                            </div>
                            <button onClick={handleAdd} className="glass-btn-primary">
                                Add
                            </button>
                            <button onClick={() => setIsAdding(false)} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                <CloseIcon />
                            </button>
                        </div>
                    </div>
                )}

                {/* Task List */}
                <div className="space-y-4">
                    {currentTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-white/5 rounded-2xl">
                            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 text-zinc-600">
                                <DayIcon sx={{ fontSize: 28 }} />
                            </div>
                            <h3 className="text-zinc-300 font-serif text-lg">No tasks scheduled</h3>
                            <p className="text-zinc-500 text-sm max-w-xs mx-auto mt-2">
                                {userMode === 'teacher'
                                    ? "Plan ahead by adding tasks for this day."
                                    : "Enjoy your free time!"
                                }
                            </p>
                            {userMode === 'teacher' && (
                                <button onClick={() => setIsAdding(true)} className="mt-6 text-amber-500 text-sm hover:underline">
                                    + create task
                                </button>
                            )}
                        </div>
                    ) : (
                        currentTasks.map((task, index) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                index={index}
                                dayColor={dayColor}
                                skill={daySkill}
                                userMode={userMode}
                                selectedStudent={selectedStudent}
                                onUpdateTask={(updated) => onUpdateTask(selectedDayName, updated)}
                                onDeleteTask={() => onDeleteTask(selectedDayName, task.id)}
                                onUpdateScore={(score) => {
                                    if (selectedStudent) {
                                        onUpdateScore(selectedStudent.id, task.id, score);
                                    }
                                }}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Floating Action Button (Teacher Only - bottom right) */}
            {userMode === 'teacher' && !isAdding && (
                <button
                    onClick={() => setIsAdding(true)}
                    className="fixed bottom-8 right-8 w-14 h-14 bg-amber-500 hover:bg-amber-400 text-white rounded-full shadow-lg shadow-amber-500/30 flex items-center justify-center transition-all hover:scale-110 z-50"
                    title="Add New Task"
                >
                    <AddIcon sx={{ fontSize: 28 }} />
                </button>
            )}
        </div>
    );
};

export default ScheduleView;
