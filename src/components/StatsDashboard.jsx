import React, { useState, useMemo, useCallback } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import StarIcon from '@mui/icons-material/Star';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

// Register ChartJS
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Theme
const THEME = {
    primary: '#288FB2',
    primaryDark: '#1C5570',
    accent: '#F2D5A9',
    warning: '#FA3404',
    success: '#34D399',
    gradient: 'linear-gradient(135deg, #1C5570 0%, #288FB2 100%)'
};

const SKILLS = [
    { name: 'Listening', color: '#288FB2', day: 'Monday' },
    { name: 'Reading', color: '#1C5570', day: 'Tuesday' },
    { name: 'Writing', color: '#34D399', day: 'Wednesday' },
    { name: 'Speaking', color: '#FA3404', day: 'Thursday' },
    { name: 'Mock Test', color: '#8B5CF6', day: 'Friday' },
];

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

const StatsDashboard = ({
    students = [],
    tasks = {},
    groups = [],
    user,
    appData,
    userMode
}) => {
    const [filterGroupId, setFilterGroupId] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    // Check if current user is a student
    const isStudent = user?.role === 'student' || userMode === 'student';

    // Get user's groups
    const userGroups = useMemo(() => {
        if (user?.role === 'headteacher') return groups;
        if (user?.role === 'teacher') return groups.filter(g => g.teacherId === user?.id);
        if (isStudent) {
            // Student only sees their own group
            return groups.filter(g => g.studentIds?.includes(user?.id));
        }
        return groups;
    }, [groups, user, isStudent]);

    // Get student's group members (for student view)
    const studentGroupMembers = useMemo(() => {
        if (!isStudent) return [];
        const studentGroup = groups.find(g => g.studentIds?.includes(user?.id));
        if (!studentGroup) return [];
        return students.filter(s => studentGroup.studentIds?.includes(s.id));
    }, [isStudent, groups, students, user]);

    // Get all tasks as array
    const allTasks = useMemo(() => {
        const tasksArray = [];
        Object.entries(tasks).forEach(([day, dayTasks]) => {
            (dayTasks || []).forEach(task => {
                tasksArray.push({ ...task, day });
            });
        });
        return tasksArray;
    }, [tasks]);

    // Get score helper - must be useCallback
    const getScore = useCallback((studentId, taskId) => {
        return appData?.scores?.[`${studentId}_${taskId}`] || 0;
    }, [appData]);

    // Get students for selected group (or student's group members for student view)
    const filteredStudents = useMemo(() => {
        // If student, only show their group members
        if (isStudent) {
            return studentGroupMembers;
        }
        // For teachers/headteachers
        if (!filterGroupId) return students;
        const group = groups.find(g => g.id === parseInt(filterGroupId));
        if (!group) return students;
        return students.filter(s => group.studentIds?.includes(s.id));
    }, [filterGroupId, groups, students, isStudent, studentGroupMembers]);

    // Calculate student stats
    const getStudentStats = useCallback((student) => {
        let totalScore = 0;
        let maxScore = 0;
        let completedTasks = 0;
        const skillScores = {};

        SKILLS.forEach(skill => {
            skillScores[skill.name] = { score: 0, max: 0, count: 0 };
        });

        allTasks.forEach(task => {
            const score = getScore(student.id, task.id);
            const taskMax = task.maxScore || 40;
            const skill = SKILLS.find(s => s.day === task.day);

            maxScore += taskMax;
            if (score > 0) {
                totalScore += score;
                completedTasks++;
                if (skill) {
                    skillScores[skill.name].score += score;
                    skillScores[skill.name].max += taskMax;
                    skillScores[skill.name].count++;
                }
            }
        });

        const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
        const band = calculateBandScore(percentage);

        const skillBands = SKILLS.map(s => {
            const data = skillScores[s.name];
            if (!data || data.max === 0) return 0;
            return calculateBandScore((data.score / data.max) * 100);
        });

        return {
            band,
            percentage,
            totalScore,
            maxScore,
            completedTasks,
            pendingTasks: allTasks.length - completedTasks,
            skillBands,
            skillScores
        };
    }, [allTasks, getScore]);

    // Get all students stats
    const studentsWithStats = useMemo(() => {
        return filteredStudents.map(student => ({
            ...student,
            stats: getStudentStats(student)
        })).sort((a, b) => b.stats.band - a.stats.band);
    }, [filteredStudents, getStudentStats]);

    // Current student's stats (for student view)
    const currentStudentStats = useMemo(() => {
        if (!isStudent || !user) return null;
        const currentStudent = students.find(s => s.id === user.id);
        if (!currentStudent) return null;
        return {
            ...currentStudent,
            stats: getStudentStats(currentStudent)
        };
    }, [isStudent, user, students, getStudentStats]);

    // Get student's rank in their group
    const studentRank = useMemo(() => {
        if (!isStudent || !currentStudentStats) return 0;
        const rankIndex = studentsWithStats.findIndex(s => s.id === user?.id);
        return rankIndex >= 0 ? rankIndex + 1 : 0;
    }, [isStudent, currentStudentStats, studentsWithStats, user]);

    // Overall stats
    const overallStats = useMemo(() => {
        if (studentsWithStats.length === 0) {
            return { avgBand: 0, totalCompleted: 0, totalPending: 0, topStudent: null };
        }

        const avgBand = studentsWithStats.reduce((sum, s) => sum + s.stats.band, 0) / studentsWithStats.length;
        const totalCompleted = studentsWithStats.reduce((sum, s) => sum + s.stats.completedTasks, 0);
        const totalPending = studentsWithStats.reduce((sum, s) => sum + s.stats.pendingTasks, 0);
        const topStudent = studentsWithStats[0];

        return { avgBand, totalCompleted, totalPending, topStudent };
    }, [studentsWithStats]);

    // Skill comparison data
    const skillComparisonData = useMemo(() => {
        if (studentsWithStats.length === 0) return { labels: [], data: [] };

        const avgSkillBands = SKILLS.map((_, index) => {
            const sum = studentsWithStats.reduce((acc, s) => acc + s.stats.skillBands[index], 0);
            return studentsWithStats.length > 0 ? sum / studentsWithStats.length : 0;
        });

        return {
            labels: SKILLS.map(s => s.name),
            datasets: [{
                label: 'Average Band',
                data: avgSkillBands,
                backgroundColor: SKILLS.map(s => s.color + '80'),
                borderColor: SKILLS.map(s => s.color),
                borderWidth: 2,
                borderRadius: 8
            }]
        };
    }, [studentsWithStats]);


    // Completion donut data
    const completionData = useMemo(() => {
        return {
            labels: ['Completed', 'Pending'],
            datasets: [{
                data: [overallStats.totalCompleted, overallStats.totalPending],
                backgroundColor: [THEME.success, THEME.warning + '60'],
                borderWidth: 0
            }]
        };
    }, [overallStats]);

    // Chart options
    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 9,
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: 'var(--text-muted)' }
            },
            x: {
                grid: { display: false },
                ticks: { color: 'var(--text-muted)' }
            }
        }
    };

    const donutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        cutout: '70%'
    };

    return (
        <div style={{ width: '100%' }}>
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
                            <AssessmentIcon sx={{ fontSize: 24, color: 'white' }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-default)', marginBottom: '4px' }}>
                                {isStudent ? 'My Statistics' : 'Statistics & Analytics'}
                            </h2>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                {isStudent
                                    ? 'Your performance and comparison with group members'
                                    : 'Performance insights and comparisons'
                                }
                            </p>
                        </div>
                    </div>

                    {/* Filters - only for teachers/headteachers */}
                    {!isStudent && (
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {userGroups.length > 0 && (
                                <select
                                    value={filterGroupId}
                                    onChange={(e) => setFilterGroupId(e.target.value)}
                                    style={{
                                        padding: '10px 16px',
                                        borderRadius: '10px',
                                        border: filterGroupId ? `2px solid ${THEME.primary}` : '1px solid var(--border-default)',
                                        background: 'var(--surface-default)',
                                        color: 'var(--text-default)',
                                        fontSize: '14px',
                                        minWidth: '160px'
                                    }}
                                >
                                    <option value="">All Groups</option>
                                    {userGroups.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* Student's Personal Stats Card */}
            {isStudent && currentStudentStats && (
                <div style={{
                    background: THEME.gradient,
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '24px'
                }}>
                    {/* Avatar */}
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        fontWeight: 700,
                        color: 'white'
                    }}>
                        {currentStudentStats.name?.charAt(0).toUpperCase()}
                    </div>

                    {/* Name & Band */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                            {currentStudentStats.name}
                        </h3>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                            Rank #{studentRank} in your group
                        </p>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{
                            padding: '16px 24px',
                            background: 'rgba(255,255,255,0.15)',
                            borderRadius: '14px',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: '28px', fontWeight: 800, color: 'white' }}>
                                {currentStudentStats.stats.band.toFixed(1)}
                            </p>
                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Band Score</p>
                        </div>
                        <div style={{
                            padding: '16px 24px',
                            background: 'rgba(255,255,255,0.15)',
                            borderRadius: '14px',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: '28px', fontWeight: 800, color: '#34D399' }}>
                                {currentStudentStats.stats.completedTasks}
                            </p>
                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Completed</p>
                        </div>
                        <div style={{
                            padding: '16px 24px',
                            background: 'rgba(255,255,255,0.15)',
                            borderRadius: '14px',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: '28px', fontWeight: 800, color: '#FBBF24' }}>
                                {currentStudentStats.stats.pendingTasks}
                            </p>
                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Pending</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {[
                    { id: 'overview', label: 'Overview', icon: TrendingUpIcon },
                    { id: 'rankings', label: isStudent ? 'Group Ranking' : 'Rankings', icon: EmojiEventsIcon },
                    // Compare tab only for teachers/headteachers
                    ...(!isStudent ? [{ id: 'compare', label: 'Compare', icon: CompareArrowsIcon }] : [])
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            border: activeTab === tab.id ? `2px solid ${THEME.primary}` : '1px solid var(--border-default)',
                            background: activeTab === tab.id ? `${THEME.primary}15` : 'var(--surface-default)',
                            color: activeTab === tab.id ? THEME.primary : 'var(--text-muted)',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        <tab.icon sx={{ fontSize: 18 }} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <>
                    {/* Stats Cards - Responsive */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '12px',
                        marginBottom: '20px'
                    }}>
                        <div style={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '16px',
                            padding: '24px',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '14px',
                                background: `${THEME.primary}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px'
                            }}>
                                <StarIcon sx={{ fontSize: 28, color: THEME.primary }} />
                            </div>
                            <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-default)', marginBottom: '4px' }}>
                                {overallStats.avgBand.toFixed(1)}
                            </p>
                            <p style={{ fontSize: '12px', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Avg Band Score</p>
                        </div>

                        <div style={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '16px',
                            padding: '24px',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '14px',
                                background: `${THEME.success}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px'
                            }}>
                                <CheckCircleIcon sx={{ fontSize: 28, color: THEME.success }} />
                            </div>
                            <p style={{ fontSize: '32px', fontWeight: 700, color: THEME.success, marginBottom: '4px' }}>
                                {overallStats.totalCompleted}
                            </p>
                            <p style={{ fontSize: '12px', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Completed Tasks</p>
                        </div>

                        <div style={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '16px',
                            padding: '24px',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '14px',
                                background: `${THEME.warning}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px'
                            }}>
                                <PendingIcon sx={{ fontSize: 28, color: THEME.warning }} />
                            </div>
                            <p style={{ fontSize: '32px', fontWeight: 700, color: THEME.warning, marginBottom: '4px' }}>
                                {overallStats.totalPending}
                            </p>
                            <p style={{ fontSize: '12px', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Pending Tasks</p>
                        </div>

                        <div style={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '16px',
                            padding: '24px',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '14px',
                                background: '#8B5CF620',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px'
                            }}>
                                <PersonIcon sx={{ fontSize: 28, color: '#8B5CF6' }} />
                            </div>
                            <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-default)', marginBottom: '4px' }}>
                                {filteredStudents.length}
                            </p>
                            <p style={{ fontSize: '12px', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Students</p>
                        </div>
                    </div>

                    {/* Charts Row - Responsive */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '16px',
                        marginBottom: '20px'
                    }}>
                        {/* Skill Performance */}
                        <div style={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '16px',
                            padding: '24px'
                        }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-default)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <TrendingUpIcon sx={{ fontSize: 20, color: THEME.primary }} />
                                Skill Performance (Average)
                            </h3>
                            <div style={{ height: '280px' }}>
                                <Bar data={skillComparisonData} options={barOptions} />
                            </div>
                        </div>

                        {/* Completion Rate */}
                        <div style={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '16px',
                            padding: '24px'
                        }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-default)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircleIcon sx={{ fontSize: 20, color: THEME.success }} />
                                Task Completion
                            </h3>
                            <div style={{ height: '200px', position: 'relative' }}>
                                <Doughnut data={completionData} options={donutOptions} />
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center'
                                }}>
                                    <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-default)' }}>
                                        {overallStats.totalCompleted + overallStats.totalPending > 0 
                                            ? Math.round((overallStats.totalCompleted / (overallStats.totalCompleted + overallStats.totalPending)) * 100)
                                            : 0}%
                                    </p>
                                    <p style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>Complete</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: THEME.success }} />
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Completed</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: THEME.warning + '60' }} />
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pending</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Performer */}
                    {overallStats.topStudent && (
                        <div style={{
                            background: THEME.gradient,
                            borderRadius: '16px',
                            padding: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px'
                        }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <EmojiEventsIcon sx={{ fontSize: 32, color: '#FFD700' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: '4px' }}>Top Performer</p>
                                <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                                    {overallStats.topStudent.name}
                                </h3>
                                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                                    Band Score: <strong>{overallStats.topStudent.stats.band.toFixed(1)}</strong> • 
                                    {' '}{overallStats.topStudent.stats.completedTasks} tasks completed
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Rankings Tab */}
            {activeTab === 'rankings' && (
                <div style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '16px',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-default)' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-default)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <EmojiEventsIcon sx={{ fontSize: 22, color: '#FFD700' }} />
                            Student Rankings
                        </h3>
                    </div>
                    
                    {studentsWithStats.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center' }}>
                            <PersonIcon sx={{ fontSize: 48, color: 'var(--text-subtle)', marginBottom: '16px' }} />
                            <p style={{ color: 'var(--text-muted)' }}>No students to rank</p>
                        </div>
                    ) : (
                        <div>
                            {studentsWithStats.map((student, index) => (
                                <div
                                    key={student.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '16px 24px',
                                        borderBottom: '1px solid var(--border-default)',
                                        background: index < 3 ? `${['#FFD700', '#C0C0C0', '#CD7F32'][index]}08` : 'transparent'
                                    }}
                                >
                                    {/* Rank */}
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '12px',
                                        background: index < 3 
                                            ? ['#FFD700', '#C0C0C0', '#CD7F32'][index] 
                                            : 'var(--surface-default)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        fontSize: '16px',
                                        color: index < 3 ? 'white' : 'var(--text-muted)'
                                    }}>
                                        {index + 1}
                                    </div>

                                    {/* Avatar */}
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '12px',
                                        background: THEME.gradient,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 700,
                                        fontSize: '18px'
                                    }}>
                                        {student.name.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-default)', marginBottom: '2px' }}>
                                            {student.name}
                                        </h4>
                                        <p style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                                            {student.stats.completedTasks} tasks • {student.stats.percentage.toFixed(0)}% score
                                        </p>
                                    </div>

                                    {/* Band Score */}
                                    <div style={{
                                        padding: '10px 18px',
                                        background: `${THEME.primary}15`,
                                        borderRadius: '12px',
                                        textAlign: 'center'
                                    }}>
                                        <p style={{ fontSize: '20px', fontWeight: 700, color: THEME.primary }}>
                                            {student.stats.band.toFixed(1)}
                                        </p>
                                        <p style={{ fontSize: '10px', color: 'var(--text-subtle)' }}>BAND</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Compare Tab */}
            {activeTab === 'compare' && (
                <div style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '16px',
                    padding: '24px'
                }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-default)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CompareArrowsIcon sx={{ fontSize: 22, color: THEME.primary }} />
                        Group Comparison
                    </h3>

                    {userGroups.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center' }}>
                            <GroupIcon sx={{ fontSize: 48, color: 'var(--text-subtle)', marginBottom: '16px' }} />
                            <p style={{ color: 'var(--text-muted)' }}>No groups to compare</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                            {userGroups.map(group => {
                                const groupStudents = students.filter(s => group.studentIds?.includes(s.id));
                                const groupStats = groupStudents.map(s => getStudentStats(s));
                                const avgBand = groupStats.length > 0 
                                    ? groupStats.reduce((sum, s) => sum + s.band, 0) / groupStats.length 
                                    : 0;
                                const totalCompleted = groupStats.reduce((sum, s) => sum + s.completedTasks, 0);

                                return (
                                    <div
                                        key={group.id}
                                        style={{
                                            padding: '20px',
                                            background: 'var(--surface-default)',
                                            borderRadius: '14px',
                                            border: '1px solid var(--border-default)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                            <div style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '12px',
                                                background: THEME.gradient,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <GroupIcon sx={{ fontSize: 22, color: 'white' }} />
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-default)' }}>{group.name}</h4>
                                                <p style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>{groupStudents.length} students</p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <div style={{
                                                padding: '12px',
                                                background: `${THEME.primary}10`,
                                                borderRadius: '10px',
                                                textAlign: 'center'
                                            }}>
                                                <p style={{ fontSize: '20px', fontWeight: 700, color: THEME.primary }}>{avgBand.toFixed(1)}</p>
                                                <p style={{ fontSize: '10px', color: 'var(--text-subtle)' }}>Avg Band</p>
                                            </div>
                                            <div style={{
                                                padding: '12px',
                                                background: `${THEME.success}10`,
                                                borderRadius: '10px',
                                                textAlign: 'center'
                                            }}>
                                                <p style={{ fontSize: '20px', fontWeight: 700, color: THEME.success }}>{totalCompleted}</p>
                                                <p style={{ fontSize: '10px', color: 'var(--text-subtle)' }}>Completed</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StatsDashboard;
