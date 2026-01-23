import React, { useState, useMemo } from 'react';
import {
    format,
    startOfWeek,
    addDays,
    addWeeks,
    subWeeks,
    isSameDay,
} from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FilterListIcon from '@mui/icons-material/FilterList';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import StarIcon from '@mui/icons-material/Star';

// Theme colors
const THEME = {
    primary: '#288FB2',
    primaryDark: '#1C5570',
    accent: '#F2D5A9',
    warning: '#FA3404',
    success: '#34D399',
    gradient: 'linear-gradient(135deg, #1C5570 0%, #288FB2 100%)'
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ScheduleView = ({
    tasks,
    students,
    selectedStudent,
    selectedGroup,
    groups = [],
    onUpdateTask,
    onAddTask,
    onDeleteTask,
    onUpdateScore,
    userMode,
    user,
    appData
}) => {
    // State
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
    const [isAdding, setIsAdding] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [filterGroupId, setFilterGroupId] = useState('');

    // Form state
    const [newTitle, setNewTitle] = useState('');
    const [newMaxScore, setNewMaxScore] = useState(40);
    const [newDeadline, setNewDeadline] = useState('18:00');
    const [selectedTaskGroup, setSelectedTaskGroup] = useState('');

    // User groups
    const userGroups = useMemo(() => {
        if (userMode !== 'teacher') return [];
        if (user?.role === 'headteacher') return groups;
        return groups.filter(g => g.teacherId === user?.id);
    }, [groups, user, userMode]);

    // Week dates
    const weekDates = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));
    }, [currentWeekStart]);

    const selectedDate = weekDates[selectedDayIndex];
    const selectedDayName = DAYS[selectedDayIndex];

    // Filter tasks by group
    const currentTasks = useMemo(() => {
        const dayTasks = tasks[selectedDayName] || [];
        if (!filterGroupId) return dayTasks;
        return dayTasks.filter(t => t.groupId === parseInt(filterGroupId) || !t.groupId);
    }, [tasks, selectedDayName, filterGroupId]);

    // Get students for selected group
    const groupStudents = useMemo(() => {
        if (!filterGroupId) return students;
        const group = groups.find(g => g.id === parseInt(filterGroupId));
        if (!group) return students;
        return students.filter(s => group.studentIds?.includes(s.id));
    }, [filterGroupId, groups, students]);

    // Get score
    const getScore = (studentId, taskId) => {
        return appData?.scores?.[`${studentId}_${taskId}`] || 0;
    };

    // Get graded count for task
    const getGradedCount = (taskId) => {
        let count = 0;
        groupStudents.forEach(s => {
            if (getScore(s.id, taskId) > 0) count++;
        });
        return count;
    };

    // Handle add task
    const handleAdd = () => {
        if (newTitle.trim()) {
            onAddTask(selectedDayName, {
                title: newTitle.trim(),
                maxScore: parseInt(newMaxScore) || 40,
                deadline: newDeadline,
                date: selectedDate.toISOString(),
                groupId: selectedTaskGroup ? parseInt(selectedTaskGroup) : null
            });
            setNewTitle('');
            setNewMaxScore(40);
            setSelectedTaskGroup('');
            setIsAdding(false);
        }
    };

    // Handle score update
    const handleScoreUpdate = (studentId, taskId, score) => {
        onUpdateScore(studentId, taskId, parseInt(score) || 0);
    };

    const handleNavigateWeek = (direction) => {
        setCurrentWeekStart(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
    };

    return (
        <div style={{ display: 'flex', gap: '24px', width: '100%', minHeight: 'calc(100vh - 48px)' }}>
            {/* Main Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {/* Header */}
                <header style={{
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '14px',
                                background: THEME.gradient,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <CalendarTodayIcon sx={{ fontSize: 24, color: 'white' }} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-default)', marginBottom: '4px' }}>
                                    Weekly Tasks
                                </h2>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                    {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            {/* Group Filter */}
                            {userMode === 'teacher' && userGroups.length > 0 && (
                                <select
                                    value={filterGroupId}
                                    onChange={(e) => setFilterGroupId(e.target.value)}
                                    style={{
                                        padding: '10px 16px',
                                        borderRadius: '10px',
                                        border: filterGroupId ? `2px solid ${THEME.primary}` : '1px solid var(--border-default)',
                                        background: filterGroupId ? `${THEME.primary}15` : 'var(--surface-default)',
                                        color: 'var(--text-default)',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        minWidth: '160px'
                                    }}
                                >
                                    <option value="">All Groups</option>
                                    {userGroups.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            )}

                            {/* Week Navigation */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '4px',
                                background: 'var(--surface-default)',
                                borderRadius: '12px',
                                border: '1px solid var(--border-default)'
                            }}>
                                <button onClick={() => handleNavigateWeek('prev')} style={{
                                    padding: '8px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'transparent',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer'
                                }}>
                                    <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
                                </button>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-default)', padding: '0 8px' }}>
                                    {isSameDay(currentWeekStart, startOfWeek(new Date(), { weekStartsOn: 1 })) ? 'This Week' : 'Week ' + format(currentWeekStart, 'w')}
                                </span>
                                <button onClick={() => handleNavigateWeek('next')} style={{
                                    padding: '8px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'transparent',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer'
                                }}>
                                    <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Day Tabs */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '8px',
                    marginBottom: '20px'
                }}>
                    {weekDates.map((date, index) => {
                        const isActive = selectedDayIndex === index;
                        const isToday = isSameDay(date, new Date());
                        const dayTasks = tasks[DAYS[index]] || [];

                        return (
                            <button
                                key={index}
                                onClick={() => setSelectedDayIndex(index)}
                                style={{
                                    padding: '12px 8px',
                                    borderRadius: '12px',
                                    border: isActive ? `2px solid ${THEME.primary}` : '1px solid var(--border-default)',
                                    background: isActive ? `${THEME.primary}20` : 'var(--surface-default)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                }}
                            >
                                <p style={{
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    color: isActive ? THEME.primary : 'var(--text-subtle)',
                                    marginBottom: '4px',
                                    letterSpacing: '0.05em'
                                }}>
                                    {format(date, 'EEE')}
                                </p>
                                <p style={{
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    color: isActive ? THEME.primary : 'var(--text-default)'
                                }}>
                                    {format(date, 'd')}
                                </p>
                                {dayTasks.length > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        background: isActive ? THEME.primary : 'var(--text-subtle)',
                                        color: 'white',
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {dayTasks.length}
                                    </span>
                                )}
                                {isToday && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '4px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: THEME.warning
                                    }} />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Day Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                }}>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-default)' }}>
                            {selectedDayName}
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            {format(selectedDate, 'MMMM d, yyyy')} • {currentTasks.length} tasks
                        </p>
                    </div>

                    {userMode === 'teacher' && (
                        <button
                            onClick={() => setIsAdding(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 20px',
                                borderRadius: '12px',
                                border: 'none',
                                background: THEME.gradient,
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                boxShadow: `0 4px 16px ${THEME.primary}50`
                            }}
                        >
                            <AddIcon sx={{ fontSize: 18 }} />
                            Add Task
                        </button>
                    )}
                </div>

                {/* Add Task Form */}
                {isAdding && userMode === 'teacher' && (
                    <div style={{
                        background: 'var(--surface-default)',
                        border: `2px solid ${THEME.primary}`,
                        borderRadius: '16px',
                        padding: '20px',
                        marginBottom: '20px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: 600, color: THEME.primary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AddIcon sx={{ fontSize: 18 }} />
                                New Task
                            </h4>
                            <button onClick={() => setIsAdding(false)} style={{
                                padding: '6px',
                                borderRadius: '6px',
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--text-muted)',
                                cursor: 'pointer'
                            }}>
                                <CloseIcon sx={{ fontSize: 18 }} />
                            </button>
                        </div>

                        {/* Group Select */}
                        {userGroups.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                                    Assign to Group
                                </label>
                                <select
                                    value={selectedTaskGroup}
                                    onChange={(e) => setSelectedTaskGroup(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border-default)',
                                        background: 'var(--bg-base)',
                                        color: 'var(--text-default)',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="">All Groups</option>
                                    {userGroups.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                                    Task Title
                                </label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Enter task title..."
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border-default)',
                                        background: 'var(--bg-base)',
                                        color: 'var(--text-default)',
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                                    Max Score
                                </label>
                                <input
                                    type="number"
                                    value={newMaxScore}
                                    onChange={(e) => setNewMaxScore(e.target.value)}
                                    min="1"
                                    max="100"
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border-default)',
                                        background: 'var(--bg-base)',
                                        color: 'var(--text-default)',
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                                    Deadline
                                </label>
                                <input
                                    type="time"
                                    value={newDeadline}
                                    onChange={(e) => setNewDeadline(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border-default)',
                                        background: 'var(--bg-base)',
                                        color: 'var(--text-default)',
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleAdd}
                            disabled={!newTitle.trim()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                width: '100%',
                                padding: '14px',
                                borderRadius: '12px',
                                border: 'none',
                                background: newTitle.trim() ? THEME.gradient : 'var(--surface-default)',
                                color: newTitle.trim() ? 'white' : 'var(--text-muted)',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: newTitle.trim() ? 'pointer' : 'not-allowed'
                            }}
                        >
                            <SaveIcon sx={{ fontSize: 18 }} />
                            Create Task
                        </button>
                    </div>
                )}

                {/* Tasks List */}
                {currentTasks.length === 0 ? (
                    <div style={{
                        background: 'var(--glass-bg)',
                        border: '2px dashed var(--border-default)',
                        borderRadius: '16px',
                        padding: '60px 40px',
                        textAlign: 'center'
                    }}>
                        <AssignmentIcon sx={{ fontSize: 48, color: 'var(--text-subtle)', marginBottom: '16px' }} />
                        <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-default)', marginBottom: '8px' }}>
                            No Tasks for {selectedDayName}
                        </h4>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                            {userMode === 'teacher' ? 'Click "Add Task" to create a new task' : 'No tasks assigned for this day'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {currentTasks.map(task => {
                            const gradedCount = getGradedCount(task.id);
                            const totalStudents = groupStudents.length;
                            const isSelected = selectedTask?.id === task.id;

                            return (
                                <div
                                    key={task.id}
                                    onClick={() => setSelectedTask(isSelected ? null : task)}
                                    style={{
                                        background: 'var(--glass-bg)',
                                        backdropFilter: 'blur(16px)',
                                        border: isSelected ? `2px solid ${THEME.primary}` : '1px solid var(--glass-border)',
                                        borderRadius: '16px',
                                        padding: '20px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Left accent bar */}
                                    <div style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: '4px',
                                        background: gradedCount === totalStudents ? THEME.success : THEME.primary,
                                        borderRadius: '4px 0 0 4px'
                                    }} />

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-default)', marginBottom: '8px' }}>
                                                {task.title}
                                            </h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                                    <StarIcon sx={{ fontSize: 14, color: THEME.accent }} />
                                                    Max: {task.maxScore} pts
                                                </span>
                                                {task.deadline && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                                        <AccessTimeIcon sx={{ fontSize: 14 }} />
                                                        {task.deadline}
                                                    </span>
                                                )}
                                                {task.groupId && (
                                                    <span style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontSize: '12px',
                                                        color: THEME.primary,
                                                        background: `${THEME.primary}15`,
                                                        padding: '4px 10px',
                                                        borderRadius: '100px'
                                                    }}>
                                                        <GroupIcon sx={{ fontSize: 12 }} />
                                                        {groups.find(g => g.id === task.groupId)?.name || 'Group'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Grading Progress */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '8px 14px',
                                                    background: gradedCount === totalStudents ? `${THEME.success}20` : 'var(--surface-default)',
                                                    border: `1px solid ${gradedCount === totalStudents ? THEME.success : 'var(--border-default)'}`,
                                                    borderRadius: '10px'
                                                }}>
                                                    {gradedCount === totalStudents ? (
                                                        <CheckCircleIcon sx={{ fontSize: 16, color: THEME.success }} />
                                                    ) : (
                                                        <PersonIcon sx={{ fontSize: 16, color: 'var(--text-muted)' }} />
                                                    )}
                                                    <span style={{
                                                        fontSize: '14px',
                                                        fontWeight: 600,
                                                        color: gradedCount === totalStudents ? THEME.success : 'var(--text-default)'
                                                    }}>
                                                        {gradedCount}/{totalStudents}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '10px', color: 'var(--text-subtle)', marginTop: '4px' }}>Graded</p>
                                            </div>

                                            {userMode === 'teacher' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm('Delete this task?')) {
                                                            onDeleteTask(selectedDayName, task.id);
                                                        }
                                                    }}
                                                    style={{
                                                        padding: '8px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #EF444440',
                                                        background: '#EF444410',
                                                        color: '#EF4444',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Student Grading Panel (Right Side) */}
            {selectedTask && userMode === 'teacher' && (
                <div style={{
                    width: '360px',
                    minWidth: '360px',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '16px',
                    height: 'fit-content',
                    maxHeight: 'calc(100vh - 100px)',
                    overflow: 'auto',
                    position: 'sticky',
                    top: '24px'
                }}>
                    {/* Panel Header */}
                    <div style={{
                        padding: '20px',
                        borderBottom: '1px solid var(--border-default)',
                        background: THEME.gradient
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>
                                Grade Students
                            </h4>
                            <button
                                onClick={() => setSelectedTask(null)}
                                style={{
                                    padding: '6px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <CloseIcon sx={{ fontSize: 16 }} />
                            </button>
                        </div>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                            {selectedTask.title}
                        </p>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                            Max Score: {selectedTask.maxScore} pts
                        </p>
                    </div>

                    {/* Students List */}
                    <div style={{ padding: '16px' }}>
                        {groupStudents.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                                <PersonIcon sx={{ fontSize: 32, opacity: 0.3, marginBottom: '8px' }} />
                                <p>No students in this group</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {groupStudents.map((student, index) => {
                                    const score = getScore(student.id, selectedTask.id);
                                    const percentage = selectedTask.maxScore > 0 ? (score / selectedTask.maxScore) * 100 : 0;

                                    return (
                                        <div
                                            key={student.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '14px',
                                                background: score > 0 ? `${THEME.success}08` : 'var(--surface-default)',
                                                border: `1px solid ${score > 0 ? THEME.success + '40' : 'var(--border-default)'}`,
                                                borderRadius: '12px'
                                            }}
                                        >
                                            {/* Avatar */}
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '10px',
                                                background: score > 0 ? THEME.gradient : 'var(--surface-raised)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: score > 0 ? 'white' : 'var(--text-muted)',
                                                fontWeight: 700,
                                                fontSize: '14px'
                                            }}>
                                                {student.name.charAt(0).toUpperCase()}
                                            </div>

                                            {/* Name */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-default)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {student.name}
                                                </p>
                                                {score > 0 && (
                                                    <p style={{ fontSize: '11px', color: THEME.success }}>
                                                        {percentage.toFixed(0)}% scored
                                                    </p>
                                                )}
                                            </div>

                                            {/* Score Input */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <input
                                                    type="number"
                                                    value={score || ''}
                                                    onChange={(e) => handleScoreUpdate(student.id, selectedTask.id, e.target.value)}
                                                    min="0"
                                                    max={selectedTask.maxScore}
                                                    placeholder="0"
                                                    style={{
                                                        width: '60px',
                                                        padding: '8px 10px',
                                                        borderRadius: '8px',
                                                        border: `1px solid ${score > 0 ? THEME.success : 'var(--border-default)'}`,
                                                        background: 'var(--bg-base)',
                                                        color: 'var(--text-default)',
                                                        fontSize: '14px',
                                                        fontWeight: 600,
                                                        textAlign: 'center',
                                                        outline: 'none'
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                                                    /{selectedTask.maxScore}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Summary */}
                        {groupStudents.length > 0 && (
                            <div style={{
                                marginTop: '20px',
                                padding: '16px',
                                background: 'var(--surface-default)',
                                borderRadius: '12px',
                                border: '1px solid var(--border-default)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Progress</span>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-default)' }}>
                                        {getGradedCount(selectedTask.id)}/{groupStudents.length} graded
                                    </span>
                                </div>
                                <div style={{
                                    marginTop: '10px',
                                    height: '8px',
                                    background: 'var(--bg-muted)',
                                    borderRadius: '100px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${(getGradedCount(selectedTask.id) / groupStudents.length) * 100}%`,
                                        background: getGradedCount(selectedTask.id) === groupStudents.length ? THEME.success : THEME.primary,
                                        borderRadius: '100px',
                                        transition: 'width 0.3s ease'
                                    }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleView;
