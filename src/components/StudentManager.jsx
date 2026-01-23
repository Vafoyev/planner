import React, { useState, useEffect, useMemo } from 'react';
import {
    getUsers,
    getGroups,
    addStudentToGroup,
    removeStudentFromGroup
} from '../data';

import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Theme colors
const THEME = {
    primary: '#288FB2',
    primaryDark: '#1C5570',
    accent: '#F2D5A9',
    warning: '#FA3404',
    success: '#34D399',
    gradient: 'linear-gradient(135deg, #1C5570 0%, #288FB2 100%)'
};

// Calculate band score from percentage
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
    return 3.5;
};

// Get level color
const getLevelColor = (band) => {
    if (band >= 7) return { bg: '#34D39920', color: '#34D399', label: 'Advanced' };
    if (band >= 5.5) return { bg: '#FBBF2420', color: '#FBBF24', label: 'Intermediate' };
    return { bg: '#EF444420', color: '#EF4444', label: 'Beginner' };
};

const StudentManager = ({
    students,
    groups,
    selectedGroup,
    user,
    fullData,
    onReload
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [availableStudents, setAvailableStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const isHeadTeacher = user?.role === 'headteacher';
    const isTeacher = user?.role === 'teacher';

    // Get teacher's groups
    const teacherGroups = isHeadTeacher
        ? groups
        : groups.filter(g => g.teacherId === user?.id);

    // Get all tasks
    const allTasks = useMemo(() => {
        const tasks = [];
        if (fullData?.tasks) {
            Object.entries(fullData.tasks).forEach(([day, dayTasks]) => {
                dayTasks.forEach(task => {
                    tasks.push({ ...task, day });
                });
            });
        }
        return tasks;
    }, [fullData]);

    // Get student statistics
    const getStudentStats = (studentId) => {
        const scores = fullData?.scores || {};
        let totalScore = 0;
        let maxScore = 0;
        let completedTasks = 0;
        let pendingTasks = 0;

        allTasks.forEach(task => {
            const scoreKey = `${studentId}_${task.id}`;
            const score = scores[scoreKey] || 0;
            maxScore += task.maxScore || 0;
            if (score > 0) {
                totalScore += score;
                completedTasks++;
            } else {
                pendingTasks++;
            }
        });

        const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
        const band = calculateBandScore(percentage);

        return { totalScore, maxScore, completedTasks, pendingTasks, percentage, band };
    };

    // Get students with all info
    const studentsWithInfo = useMemo(() => {
        return students.map(student => {
            const studentGroups = groups.filter(g => g.studentIds?.includes(student.id));
            const stats = getStudentStats(student.id);

            // Get teacher for first group
            const primaryGroup = studentGroups[0];
            const teacher = primaryGroup
                ? getUsers().find(u => u.id === primaryGroup.teacherId)
                : null;

            return {
                ...student,
                groups: studentGroups,
                teacher,
                stats
            };
        });
    }, [students, groups, fullData]);

    useEffect(() => {
        if (isAdding && selectedGroupId) {
            const allUsers = getUsers();
            const group = groups.find(g => g.id === Number(selectedGroupId));
            const available = allUsers.filter(u =>
                u.role === 'student' && !group?.studentIds?.includes(u.id)
            );
            setAvailableStudents(available);
            if (available.length > 0) setSelectedUserId(available[0].id);
        }
    }, [isAdding, selectedGroupId, groups]);

    const handleAdd = () => {
        if (selectedUserId && selectedGroupId) {
            addStudentToGroup(Number(selectedGroupId), Number(selectedUserId));
            setIsAdding(false);
            setSelectedUserId('');
            setSelectedGroupId('');
            onReload();
        }
    };

    const handleRemove = (groupId, studentId) => {
        if (window.confirm('Remove this student from the group?')) {
            removeStudentFromGroup(groupId, studentId);
            onReload();
        }
    };

    return (
        <div style={{ display: 'flex', gap: '24px', width: '100%' }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
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
                                <SchoolIcon sx={{ fontSize: 24, color: 'white' }} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-default)', marginBottom: '4px' }}>
                                    Students
                                </h2>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                    {students.length} students • {teacherGroups.length} groups
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setIsAdding(true);
                                if (teacherGroups.length > 0) {
                                    setSelectedGroupId(teacherGroups[0].id.toString());
                                }
                            }}
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
                            <PersonAddIcon sx={{ fontSize: 18 }} />
                            Add to Group
                        </button>
                    </div>
                </header>

                {/* Add Student Form */}
                {isAdding && (
                    <div style={{
                        background: 'var(--surface-default)',
                        border: `2px solid ${THEME.primary}`,
                        borderRadius: '16px',
                        padding: '20px',
                        marginBottom: '20px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: 600, color: THEME.primary }}>
                                Add Student to Group
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

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                                    Select Group
                                </label>
                                <select
                                    value={selectedGroupId}
                                    onChange={(e) => setSelectedGroupId(e.target.value)}
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
                                    <option value="">-- Select Group --</option>
                                    {teacherGroups.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                                    Select Student
                                </label>
                                {selectedGroupId && availableStudents.length > 0 ? (
                                    <select
                                        value={selectedUserId}
                                        onChange={(e) => setSelectedUserId(e.target.value)}
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
                                        {availableStudents.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div style={{
                                        padding: '12px 14px',
                                        borderRadius: '10px',
                                        background: 'var(--surface-default)',
                                        color: 'var(--text-muted)',
                                        fontSize: '14px'
                                    }}>
                                        {selectedGroupId ? 'No students available' : 'Select a group first'}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleAdd}
                                disabled={!selectedUserId || !selectedGroupId}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 20px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: (selectedUserId && selectedGroupId) ? THEME.gradient : 'var(--surface-default)',
                                    color: (selectedUserId && selectedGroupId) ? 'white' : 'var(--text-muted)',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: (selectedUserId && selectedGroupId) ? 'pointer' : 'not-allowed'
                                }}
                            >
                                <PersonAddIcon sx={{ fontSize: 18 }} />
                                Add
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    <div style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '14px',
                        padding: '20px',
                        textAlign: 'center'
                    }}>
                        <PersonIcon sx={{ fontSize: 28, color: THEME.primary, marginBottom: '8px' }} />
                        <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-default)' }}>{students.length}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Total Students</p>
                    </div>
                    <div style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '14px',
                        padding: '20px',
                        textAlign: 'center'
                    }}>
                        <GroupIcon sx={{ fontSize: 28, color: '#8B5CF6', marginBottom: '8px' }} />
                        <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-default)' }}>{teacherGroups.length}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Groups</p>
                    </div>
                    <div style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '14px',
                        padding: '20px',
                        textAlign: 'center'
                    }}>
                        <AssignmentIcon sx={{ fontSize: 28, color: THEME.warning, marginBottom: '8px' }} />
                        <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-default)' }}>{allTasks.length}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Total Tasks</p>
                    </div>
                    <div style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '14px',
                        padding: '20px',
                        textAlign: 'center'
                    }}>
                        <TrendingUpIcon sx={{ fontSize: 28, color: THEME.success, marginBottom: '8px' }} />
                        <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-default)' }}>
                            {studentsWithInfo.length > 0
                                ? (studentsWithInfo.reduce((sum, s) => sum + s.stats.band, 0) / studentsWithInfo.length).toFixed(1)
                                : '-'
                            }
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Avg Band</p>
                    </div>
                </div>

                {/* Students Grid */}
                {students.length === 0 ? (
                    <div style={{
                        background: 'var(--glass-bg)',
                        border: '2px dashed var(--border-default)',
                        borderRadius: '16px',
                        padding: '60px 40px',
                        textAlign: 'center'
                    }}>
                        <PersonIcon sx={{ fontSize: 48, color: 'var(--text-subtle)', marginBottom: '16px' }} />
                        <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-default)', marginBottom: '8px' }}>
                            No Students Yet
                        </h4>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                            Add students to your groups to start tracking their progress
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                        {studentsWithInfo.map((student) => {
                            const level = getLevelColor(student.stats.band);
                            const isSelected = selectedStudent?.id === student.id;

                            return (
                                <div
                                    key={student.id}
                                    onClick={() => setSelectedStudent(isSelected ? null : student)}
                                    style={{
                                        background: 'var(--glass-bg)',
                                        backdropFilter: 'blur(16px)',
                                        border: isSelected ? `2px solid ${THEME.primary}` : '1px solid var(--glass-border)',
                                        borderRadius: '16px',
                                        padding: '20px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {/* Header */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '52px',
                                            height: '52px',
                                            borderRadius: '14px',
                                            background: THEME.gradient,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 700,
                                            fontSize: '20px'
                                        }}>
                                            {student.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-default)', marginBottom: '4px' }}>
                                                {student.name}
                                            </h4>
                                            <p style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>@{student.username}</p>
                                        </div>
                                        {/* Level Badge */}
                                        <div style={{
                                            padding: '6px 12px',
                                            borderRadius: '100px',
                                            background: level.bg,
                                            border: `1px solid ${level.color}40`
                                        }}>
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: level.color }}>
                                                {level.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                                        {/* Group */}
                                        <div style={{
                                            padding: '10px 12px',
                                            background: 'var(--surface-default)',
                                            borderRadius: '10px'
                                        }}>
                                            <p style={{ fontSize: '10px', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '4px' }}>Group</p>
                                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-default)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <GroupIcon sx={{ fontSize: 14, color: THEME.primary }} />
                                                {student.groups.length > 0 ? student.groups[0].name : 'None'}
                                            </p>
                                        </div>

                                        {/* Teacher */}
                                        <div style={{
                                            padding: '10px 12px',
                                            background: 'var(--surface-default)',
                                            borderRadius: '10px'
                                        }}>
                                            <p style={{ fontSize: '10px', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '4px' }}>Teacher</p>
                                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-default)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <SchoolIcon sx={{ fontSize: 14, color: '#8B5CF6' }} />
                                                {student.teacher?.name || 'None'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stats Row */}
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {/* Band Score */}
                                        <div style={{
                                            flex: 1,
                                            padding: '12px',
                                            background: `${THEME.primary}15`,
                                            borderRadius: '10px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
                                                <StarIcon sx={{ fontSize: 14, color: THEME.accent }} />
                                                <span style={{ fontSize: '18px', fontWeight: 700, color: THEME.primary }}>
                                                    {student.stats.band.toFixed(1)}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '9px', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Band</p>
                                        </div>

                                        {/* Completed */}
                                        <div style={{
                                            flex: 1,
                                            padding: '12px',
                                            background: `${THEME.success}15`,
                                            borderRadius: '10px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
                                                <CheckCircleIcon sx={{ fontSize: 14, color: THEME.success }} />
                                                <span style={{ fontSize: '18px', fontWeight: 700, color: THEME.success }}>
                                                    {student.stats.completedTasks}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '9px', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Done</p>
                                        </div>

                                        {/* Pending */}
                                        <div style={{
                                            flex: 1,
                                            padding: '12px',
                                            background: `${THEME.warning}15`,
                                            borderRadius: '10px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
                                                <PendingIcon sx={{ fontSize: 14, color: THEME.warning }} />
                                                <span style={{ fontSize: '18px', fontWeight: 700, color: THEME.warning }}>
                                                    {student.stats.pendingTasks}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '9px', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Pending</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Student Detail Panel (Right Side) */}
            {selectedStudent && (
                <div style={{
                    width: '380px',
                    minWidth: '380px',
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
                    {/* Header */}
                    <div style={{
                        padding: '24px',
                        borderBottom: '1px solid var(--border-default)',
                        background: THEME.gradient,
                        textAlign: 'center'
                    }}>
                        <button
                            onClick={() => setSelectedStudent(null)}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
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

                        <div style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            color: 'white',
                            fontSize: '28px',
                            fontWeight: 700
                        }}>
                            {selectedStudent.name.charAt(0).toUpperCase()}
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                            {selectedStudent.name}
                        </h3>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                            @{selectedStudent.username}
                        </p>

                        {/* Big Band Score */}
                        <div style={{
                            marginTop: '20px',
                            padding: '16px',
                            background: 'rgba(255,255,255,0.15)',
                            borderRadius: '14px',
                            display: 'inline-block'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <EmojiEventsIcon sx={{ fontSize: 24, color: THEME.accent }} />
                                <span style={{ fontSize: '32px', fontWeight: 800, color: 'white' }}>
                                    {selectedStudent.stats.band.toFixed(1)}
                                </span>
                                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Band</span>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div style={{ padding: '20px' }}>
                        {/* Info Cards */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                            {/* Group */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '14px',
                                background: 'var(--surface-default)',
                                borderRadius: '12px'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: `${THEME.primary}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <GroupIcon sx={{ fontSize: 20, color: THEME.primary }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Group</p>
                                    <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-default)' }}>
                                        {selectedStudent.groups.length > 0 ? selectedStudent.groups.map(g => g.name).join(', ') : 'Not assigned'}
                                    </p>
                                </div>
                            </div>

                            {/* Teacher */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '14px',
                                background: 'var(--surface-default)',
                                borderRadius: '12px'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: '#8B5CF620',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <SchoolIcon sx={{ fontSize: 20, color: '#8B5CF6' }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Teacher</p>
                                    <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-default)' }}>
                                        {selectedStudent.teacher?.name || 'Not assigned'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Statistics */}
                        <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
                            Performance
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                            <div style={{
                                padding: '16px',
                                background: `${THEME.success}10`,
                                border: `1px solid ${THEME.success}30`,
                                borderRadius: '12px',
                                textAlign: 'center'
                            }}>
                                <CheckCircleIcon sx={{ fontSize: 24, color: THEME.success, marginBottom: '4px' }} />
                                <p style={{ fontSize: '24px', fontWeight: 700, color: THEME.success }}>{selectedStudent.stats.completedTasks}</p>
                                <p style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>Completed</p>
                            </div>
                            <div style={{
                                padding: '16px',
                                background: `${THEME.warning}10`,
                                border: `1px solid ${THEME.warning}30`,
                                borderRadius: '12px',
                                textAlign: 'center'
                            }}>
                                <PendingIcon sx={{ fontSize: 24, color: THEME.warning, marginBottom: '4px' }} />
                                <p style={{ fontSize: '24px', fontWeight: 700, color: THEME.warning }}>{selectedStudent.stats.pendingTasks}</p>
                                <p style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>Pending</p>
                            </div>
                        </div>

                        {/* Score Progress */}
                        <div style={{
                            padding: '16px',
                            background: 'var(--surface-default)',
                            borderRadius: '12px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Score</span>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-default)' }}>
                                    {selectedStudent.stats.totalScore}/{selectedStudent.stats.maxScore} pts
                                </span>
                            </div>
                            <div style={{
                                height: '10px',
                                background: 'var(--bg-muted)',
                                borderRadius: '100px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${selectedStudent.stats.percentage}%`,
                                    background: THEME.gradient,
                                    borderRadius: '100px'
                                }} />
                            </div>
                            <p style={{ fontSize: '12px', color: THEME.primary, marginTop: '8px', textAlign: 'right' }}>
                                {selectedStudent.stats.percentage.toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentManager;
