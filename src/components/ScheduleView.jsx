import React, { useState, useMemo } from 'react';
import TaskCard from './TaskCard';
import {
    format,
    startOfWeek,
    addDays,
    addWeeks,
    subWeeks,
    isSameDay,
} from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import EditNoteIcon from '@mui/icons-material/EditNote';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import QuizIcon from '@mui/icons-material/Quiz';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FilterListIcon from '@mui/icons-material/FilterList';

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
    selectedGroup,
    onUpdateTask,
    onAddTask,
    onDeleteTask,
    onUpdateScore,
    userMode,
    user,
    appData
}) => {
    // Week State
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [isAdding, setIsAdding] = useState(false);

    // Add Task State
    const [newTitle, setNewTitle] = useState('');
    const [newMaxScore, setNewMaxScore] = useState(40);
    const [newDeadline, setNewDeadline] = useState('18:00');
    const [newDeadlineDate, setNewDeadlineDate] = useState('');

    // Memos
    const weekDates = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));
    }, [currentWeekStart]);

    const selectedDate = weekDates[selectedDayIndex];
    const selectedDayName = format(selectedDate, 'EEEE');

    const currentTasks = tasks[selectedDayName] || [];

    const DayIcon = DAY_INFO[selectedDayName]?.icon || CalendarTodayIcon;
    const daySkill = DAY_INFO[selectedDayName]?.skill || 'General';
    const dayColor = DAY_INFO[selectedDayName]?.color || 'blue';

    // Get score from appData
    const getScore = (studentId, taskId) => {
        return appData?.scores?.[`${studentId}_${taskId}`] || 0;
    };

    // Calculate stats for selected student
    const getStudentStats = () => {
        if (!selectedStudent) return { earned: 0, max: 0, band: 0, graded: 0 };

        let earned = 0, max = 0, graded = 0;
        currentTasks.forEach(task => {
            max += task.maxScore || 0;
            const score = getScore(selectedStudent.id, task.id);
            if (score > 0) {
                earned += score;
                graded++;
            }
        });
        const pct = max > 0 ? (earned / max) * 100 : 0;
        return { earned, max, band: calculateBandScore(pct), graded, pct };
    };

    const stats = getStudentStats();

    // Set default deadline date
    React.useEffect(() => {
        const maxDate = addDays(selectedDate, 7);
        setNewDeadlineDate(format(maxDate, 'yyyy-MM-dd'));
    }, [selectedDate]);

    const handleAdd = () => {
        if (newTitle.trim()) {
            onAddTask(selectedDayName, {
                title: newTitle.trim(),
                maxScore: parseInt(newMaxScore) || 40,
                deadline: newDeadline,
                deadlineDate: newDeadlineDate,
                date: selectedDate.toISOString()
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
            <header className="page-glass-header mb-6 md:mb-8 flex-col md:flex-row gap-4 md:items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="header-icon-glass">
                        <CalendarTodayIcon sx={{ fontSize: 24, color: '#f59e0b' }} />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-serif text-white">Weekly Tasks</h2>
                        <p className="text-secondary text-xs md:text-sm font-sans opacity-70">
                            {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 md:items-center w-full md:w-auto">
                    {selectedGroup && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30 w-full md:w-auto justify-center md:justify-start">
                            <FilterListIcon sx={{ fontSize: 16, color: '#818cf8' }} />
                            <span className="text-sm text-indigo-400 truncate max-w-[150px]">{selectedGroup.name}</span>
                        </div>
                    )}

                    <div className="flex items-center justify-between md:justify-start gap-2 bg-black/20 rounded-full p-1 border border-white/5 w-full md:w-auto">
                        <button onClick={() => handleNavigateWeek('prev')} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
                            <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
                        </button>
                        <span className="text-sm font-medium px-2 flex-1 md:flex-none text-center text-white">
                            {isSameDay(currentWeekStart, startOfWeek(new Date(), { weekStartsOn: 1 })) ? 'This Week' : 'Week ' + format(currentWeekStart, 'w')}
                        </span>
                        <button onClick={() => handleNavigateWeek('next')} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
                            <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Day Tabs - Scrollable on mobile */}
            <div className="day-tabs-container mb-6 md:mb-8 flex md:grid md:grid-cols-7 gap-3 md:gap-4 overflow-x-auto pb-4 md:pb-0 hide-scrollbar snap-x snap-mandatory">
                {weekDates.map((date, index) => {
                    const dayName = format(date, 'EEEE');
                    const info = DAY_INFO[dayName];
                    const isActive = selectedDayIndex === index;
                    const dayTasks = tasks[dayName] || [];

                    return (
                        <div
                            key={dayName}
                            onClick={() => setSelectedDayIndex(index)}
                            className={`
                                min-w-[100px] md:min-w-0 flex-shrink-0 snap-start
                                cursor-pointer rounded-xl p-3 md:p-4 transition-all duration-300 border
                                ${isActive
                                    ? 'bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border-amber-500/50 shadow-lg shadow-amber-900/20 transform -translate-y-1'
                                    : 'bg-slate-800/30 border-white/5 hover:bg-slate-800/50 hover:border-white/10'
                                }
                            `}
                        >
                            <div className="flex flex-col items-center gap-1 md:gap-2">
                                <span className={`text-[10px] md:text-xs font-semibold tracking-wider uppercase ${isActive ? 'text-amber-400' : 'text-zinc-500'}`}>
                                    {dayName.substring(0, 3)}
                                </span>
                                <span className={`text-lg md:text-xl font-serif font-bold ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                                    {format(date, 'd')}
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-zinc-500 hidden md:inline">{info.skill}</span>
                                    <span className="md:hidden text-[10px] text-zinc-500">{info.skill.substring(0, 4)}..</span>
                                    {dayTasks.length > 0 && (
                                        <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-amber-500/20 text-amber-400 text-[8px] md:text-[10px] flex items-center justify-center">
                                            {dayTasks.length}
                                        </span>
                                    )}
                                </div>
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
                            <h3 className="text-xl font-serif text-white">{selectedDayName} - {daySkill}</h3>
                            <p className="text-sm text-zinc-400 font-sans mt-0.5">
                                {format(selectedDate, 'MMMM do, yyyy')} • {currentTasks.length} tasks
                            </p>
                        </div>
                    </div>

                    {/* Student Stats */}
                    {userMode === 'teacher' && selectedStudent && (
                        <div className="flex items-center gap-4 bg-black/20 px-4 py-2 rounded-lg border border-white/5">
                            <span className="text-sm text-zinc-300">{selectedStudent.name}</span>
                            <div className={`px-3 py-1 rounded-md text-xs font-bold ${stats.band >= 6 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                Band {stats.band > 0 ? stats.band.toFixed(1) : '-'}
                            </div>
                        </div>
                    )}
                </div>

                {/* Add Task Panel - Teacher Only */}
                {userMode === 'teacher' && isAdding && (
                    <div className="mb-6 bg-slate-800/50 p-6 rounded-xl border border-amber-500/20 animation-slide-down">
                        <h4 className="text-amber-500 mb-4 font-medium flex items-center gap-2 text-sm uppercase tracking-wide">
                            <AddIcon sx={{ fontSize: 16 }} />
                            New Task
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="lg:col-span-2">
                                <label className="block text-xs text-zinc-500 mb-1">Task Title</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAdd();
                                        if (e.key === 'Escape') setIsAdding(false);
                                    }}
                                    placeholder="e.g., Reading Part 1..."
                                    autoFocus
                                    className="glass-input w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-zinc-500 mb-1">Deadline Date</label>
                                <input
                                    type="date"
                                    value={newDeadlineDate}
                                    onChange={(e) => setNewDeadlineDate(e.target.value)}
                                    min={format(selectedDate, 'yyyy-MM-dd')}
                                    max={format(addDays(selectedDate, 7), 'yyyy-MM-dd')}
                                    className="glass-input w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-zinc-500 mb-1">Time</label>
                                <div className="flex items-center gap-2 glass-input px-3">
                                    <AccessTimeIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                                    <input
                                        type="time"
                                        value={newDeadline}
                                        onChange={(e) => setNewDeadline(e.target.value)}
                                        className="bg-transparent border-none outline-none text-white text-sm font-sans w-full"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-zinc-500 mb-1">Max Score</label>
                                <div className="flex items-center gap-2 glass-input">
                                    <input
                                        type="number"
                                        value={newMaxScore}
                                        onChange={(e) => setNewMaxScore(e.target.value)}
                                        min="1"
                                        max="100"
                                        className="bg-transparent text-white w-full text-center outline-none font-medium"
                                    />
                                    <span className="text-zinc-500 text-xs">pts</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button onClick={handleAdd} className="glass-btn-primary">
                                <AddIcon sx={{ fontSize: 18 }} />
                                Create Task
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
                                    ? "Click the + button to create a task for this day."
                                    : "No assignments for today. Enjoy your free time!"
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
                                studentScore={selectedStudent ? getScore(selectedStudent.id, task.id) : 0}
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

            {/* Floating Action Button (Teacher Only) */}
            {userMode === 'teacher' && !isAdding && (
                <button
                    onClick={() => setIsAdding(true)}
                    className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-full shadow-lg shadow-amber-500/30 flex items-center justify-center transition-all hover:scale-110 z-50"
                    title="Add New Task"
                >
                    <AddIcon sx={{ fontSize: 28 }} />
                </button>
            )}
        </div>
    );
};

export default ScheduleView;
