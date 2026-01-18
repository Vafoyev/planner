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
import { Bar, Line, Pie, Doughnut, Scatter } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import StarIcon from '@mui/icons-material/Star';
import TimelineIcon from '@mui/icons-material/Timeline';
import FilterListIcon from '@mui/icons-material/FilterList';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';

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

const SKILLS = [
    { name: 'Listening', key: 'Listening', color: '#3b82f6', day: 'Monday' },
    { name: 'Reading', key: 'Reading', color: '#10b981', day: 'Tuesday' },
    { name: 'Writing', key: 'Writing', color: '#f59e0b', day: 'Wednesday' },
    { name: 'Speaking', key: 'Speaking', color: '#ef4444', day: 'Thursday' },
    { name: 'Mock Test', key: 'MockTest', color: '#8b5cf6', day: 'Friday' },
    { name: 'Review', key: 'Review', color: '#ec4899', day: 'Sunday' },
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
    if (percentage >= 20) return 3.5;
    if (percentage >= 13) return 3.0;
    return 0;
};

// Summary Card Component
const SummaryCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="glass-panel p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <Icon sx={{ fontSize: 24, color }} />
        </div>
        <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-bold text-white">{value}</h3>
            {subtitle && <p className="text-xs text-zinc-600 mt-0.5">{subtitle}</p>}
        </div>
    </div>
);

const StatsDashboard = ({
    students = [],
    selectedStudent,
    tasks = {},
    groups = [],
    selectedGroup,
    userMode,
    user
}) => {
    const [filterGroup, setFilterGroup] = useState(selectedGroup?.id || '');
    const [filterStudent, setFilterStudent] = useState(selectedStudent?.id || '');
    const [timePeriod, setTimePeriod] = useState('overall');

    // Filter students by group
    const filteredStudents = useMemo(() => {
        if (filterGroup) {
            const group = groups.find(g => g.id === Number(filterGroup));
            return students.filter(s => group?.studentIds?.includes(s.id));
        }
        return students;
    }, [students, groups, filterGroup]);

    // Get current student for stats
    const currentStudent = useMemo(() => {
        if (filterStudent) {
            return students.find(s => s.id === Number(filterStudent));
        }
        return selectedStudent;
    }, [filterStudent, selectedStudent, students]);

    // Calculate student stats
    const getStudentStats = useCallback((student) => {
        if (!student) return null;

        let totalScore = 0;
        let totalMax = 0;
        let skillScores = {};
        let progressData = [];
        let progressLabels = [];
        let completedTasks = 0;
        let totalTasks = 0;

        SKILLS.forEach(skill => {
            skillScores[skill.key] = { score: 0, max: 0 };
        });

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        days.forEach(day => {
            const dayTasks = tasks[day] || [];
            const skill = SKILLS.find(s => s.day === day);

            dayTasks.forEach(task => {
                totalTasks++;
                const score = student.scores?.[task.id] || 0;
                const max = task.maxScore || 40;

                if (score > 0) {
                    completedTasks++;
                    totalScore += score;
                    totalMax += max;

                    if (skill) {
                        skillScores[skill.key].score += score;
                        skillScores[skill.key].max += max;
                    }

                    const pct = (score / max) * 100;
                    progressData.push(calculateBandScore(pct));
                    const taskDate = task.date ? format(parseISO(task.date), 'MMM d') : day.substring(0, 3);
                    progressLabels.push(taskDate);
                }
            });
        });

        // Calculate skill bands
        const skillBands = SKILLS.map(s => {
            const data = skillScores[s.key];
            if (!data || data.max === 0) return 0;
            return calculateBandScore((data.score / data.max) * 100);
        });

        const overallPct = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
        const overallBand = calculateBandScore(overallPct);

        return {
            overallBand,
            skillBands,
            progressData,
            progressLabels,
            completedTasks,
            totalTasks,
            participation: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
            totalScore,
            totalMax
        };
    }, [tasks]);

    const currentStats = useMemo(() => {
        return currentStudent
            ? getStudentStats(currentStudent)
            : { overallBand: 0, skillBands: [0, 0, 0, 0, 0, 0], progressData: [], participation: 0, completedTasks: 0, totalTasks: 0 };
    }, [currentStudent, getStudentStats]);

    // Chart Options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(23, 23, 23, 0.95)',
                titleColor: '#fff',
                bodyColor: '#a1a1aa',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                padding: 12,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 9,
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#71717a' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#a1a1aa' }
            }
        }
    };

    // Bar Chart Data
    const barChartData = {
        labels: SKILLS.map(s => s.name),
        datasets: [{
            data: currentStats.skillBands,
            backgroundColor: SKILLS.map(s => s.color + 'CC'),
            borderRadius: 6,
            barThickness: 30,
        }]
    };

    // Line Chart Data
    const lineChartData = {
        labels: currentStats.progressLabels,
        datasets: [{
            data: currentStats.progressData,
            fill: true,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4,
            pointBackgroundColor: '#09090b',
            pointBorderColor: '#f59e0b',
            pointBorderWidth: 2,
            pointRadius: 4,
        }]
    };

    // Pie Chart Data - Task Distribution
    const pieChartData = {
        labels: SKILLS.map(s => s.name),
        datasets: [{
            data: SKILLS.map(s => (tasks[s.day] || []).length),
            backgroundColor: SKILLS.map(s => s.color + 'CC'),
            borderColor: SKILLS.map(s => s.color),
            borderWidth: 2,
        }]
    };

    // Doughnut Chart Data - Completion Status
    const doughnutChartData = {
        labels: ['Completed', 'Pending'],
        datasets: [{
            data: [
                currentStats.completedTasks,
                Math.max(0, currentStats.totalTasks - currentStats.completedTasks)
            ],
            backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)'],
            borderColor: ['rgba(16, 185, 129, 1)', 'rgba(245, 158, 11, 1)'],
            borderWidth: 2,
        }]
    };

    // Class Comparison Data (for teachers)
    const classComparisonData = useMemo(() => {
        if (userMode !== 'teacher' || filteredStudents.length === 0) return null;

        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

        return {
            labels: filteredStudents.map(s => s.name),
            datasets: [{
                label: 'Overall Band',
                data: filteredStudents.map(s => getStudentStats(s)?.overallBand || 0),
                backgroundColor: colors.slice(0, filteredStudents.length).map(c => c + '80'),
                borderColor: colors.slice(0, filteredStudents.length),
                borderWidth: 2,
                borderRadius: 8,
            }]
        };
    }, [filteredStudents, userMode, getStudentStats]);

    // Teacher Groups Filter
    const teacherGroups = userMode === 'teacher'
        ? (user?.role === 'headteacher' ? groups : groups.filter(g => g.teacherId === user?.id))
        : [];

    return (
        <div className="stats-dashboard">
            {/* Header */}
            <header className="page-glass-header mb-6 md:mb-8 flex-col md:flex-row gap-4 justify-between">
                <div className="flex items-center gap-4">
                    <div className="header-icon-glass">
                        <AssessmentIcon sx={{ fontSize: 28, color: '#f59e0b' }} />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-serif text-white">Statistics Dashboard</h2>
                        <p className="text-xs md:text-sm text-zinc-400 font-sans">Performance analytics and insights</p>
                    </div>
                </div>

                {/* Filters */}
                {userMode === 'teacher' && (
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 w-full md:w-auto">
                        {/* Group Filter */}
                        <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1 border border-white/5 w-full md:w-auto">
                            <div className="p-1.5 rounded-md bg-indigo-500/20">
                                <GroupIcon sx={{ fontSize: 16, color: '#818cf8' }} />
                            </div>
                            <select
                                value={filterGroup}
                                onChange={(e) => {
                                    setFilterGroup(e.target.value);
                                    setFilterStudent('');
                                }}
                                className="bg-transparent text-white text-xs md:text-sm py-1.5 focus:outline-none w-full md:min-w-[140px]"
                            >
                                <option value="" className="text-slate-900">All Groups</option>
                                {teacherGroups.map(g => (
                                    <option key={g.id} value={g.id} className="text-slate-900">{g.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Student Filter */}
                        <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1 border border-white/5 w-full md:w-auto">
                            <div className="p-1.5 rounded-md bg-emerald-500/20">
                                <PersonIcon sx={{ fontSize: 16, color: '#34d399' }} />
                            </div>
                            <select
                                value={filterStudent}
                                onChange={(e) => setFilterStudent(e.target.value)}
                                className="bg-transparent text-white text-xs md:text-sm py-1.5 focus:outline-none w-full md:min-w-[140px]"
                            >
                                <option value="" className="text-slate-900">All Students</option>
                                {filteredStudents.map(s => (
                                    <option key={s.id} value={s.id} className="text-slate-900">{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </header>

            {/* Class Overview (Teacher - No specific student selected) */}
            {userMode === 'teacher' && !currentStudent && filteredStudents.length > 0 && (
                <>
                    {/* Class Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <SummaryCard
                            title="Total Students"
                            value={filteredStudents.length}
                            subtitle={filterGroup ? 'In selected group' : 'All groups'}
                            icon={GroupIcon}
                            color="#8b5cf6"
                        />
                        <SummaryCard
                            title="Avg. Band Score"
                            value={
                                filteredStudents.length > 0
                                    ? (filteredStudents.reduce((acc, s) => acc + (getStudentStats(s)?.overallBand || 0), 0) / filteredStudents.length).toFixed(1)
                                    : '—'
                            }
                            subtitle="Class average"
                            icon={StarIcon}
                            color="#f59e0b"
                        />
                        <SummaryCard
                            title="Total Tasks"
                            value={Object.values(tasks).flat().length}
                            subtitle="This period"
                            icon={AssignmentIcon}
                            color="#3b82f6"
                        />
                        <SummaryCard
                            title="Avg. Participation"
                            value={
                                filteredStudents.length > 0
                                    ? Math.round(filteredStudents.reduce((acc, s) => acc + (getStudentStats(s)?.participation || 0), 0) / filteredStudents.length) + '%'
                                    : '—'
                            }
                            subtitle="Task completion"
                            icon={TrendingUpIcon}
                            color="#10b981"
                        />
                    </div>

                    {/* Class Comparison Chart */}
                    <div className="glass-panel p-8 mb-8 border-indigo-500/20 border-2 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500/50 to-transparent"></div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                <AssessmentIcon sx={{ fontSize: 24, color: '#818cf8' }} />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white">Student Comparison</h3>
                                <p className="text-xs text-zinc-400 uppercase tracking-wider">Band scores by student</p>
                            </div>
                        </div>
                        <div className="h-[300px]">
                            {classComparisonData && classComparisonData.labels.length > 0 ? (
                                <Bar data={classComparisonData} options={{
                                    ...chartOptions,
                                    indexAxis: filteredStudents.length > 5 ? 'y' : 'x',
                                    scales: {
                                        ...chartOptions.scales,
                                        x: { ...chartOptions.scales.x, max: 9 }
                                    }
                                }} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-zinc-500">
                                    No data available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Student Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStudents.map(student => {
                            const stats = getStudentStats(student);
                            return (
                                <div
                                    key={student.id}
                                    className="glass-panel p-6 cursor-pointer hover:border-amber-500/30 transition-colors"
                                    onClick={() => setFilterStudent(student.id.toString())}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                                                {student.name.charAt(0)}
                                            </div>
                                            <h4 className="font-semibold text-white">{student.name}</h4>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${stats.overallBand >= 6
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : 'bg-amber-500/20 text-amber-400'
                                            }`}>
                                            Band {stats.overallBand.toFixed(1)}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Participation</span>
                                            <span className="text-white">{stats.participation}%</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                                                style={{ width: `${stats.participation}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Tasks</span>
                                            <span className="text-white">{stats.completedTasks}/{stats.totalTasks}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Individual Student Stats */}
            {currentStudent && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <SummaryCard
                            title="Overall Band"
                            value={currentStats.overallBand > 0 ? currentStats.overallBand.toFixed(1) : "—"}
                            subtitle={currentStats.overallBand >= 6 ? "Good Level" : "Beginner"}
                            icon={StarIcon}
                            color="#f59e0b"
                        />
                        <SummaryCard
                            title="Completed Tasks"
                            value={currentStats.completedTasks.toString()}
                            subtitle={`of ${currentStats.totalTasks} total`}
                            icon={AssignmentIcon}
                            color="#3b82f6"
                        />
                        <SummaryCard
                            title="Participation"
                            value={`${currentStats.participation}%`}
                            subtitle="Task completion rate"
                            icon={TimelineIcon}
                            color="#10b981"
                        />
                        <SummaryCard
                            title="Weakest Skill"
                            value={
                                currentStats.skillBands.every(b => b === 0)
                                    ? "—"
                                    : SKILLS[currentStats.skillBands.indexOf(Math.min(...currentStats.skillBands.filter(b => b > 0)))]?.name || "None"
                            }
                            subtitle="Focus area"
                            icon={TrendingUpIcon}
                            color="#ef4444"
                        />
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Bar Chart - Skills */}
                        <div className="glass-panel p-8 border-purple-500/20 border-2 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                    <AssessmentIcon sx={{ fontSize: 24, color: '#a78bfa' }} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Skill Breakdown</h3>
                                    <p className="text-xs text-zinc-400 uppercase tracking-wider">Bar Chart</p>
                                </div>
                            </div>
                            <div className="h-[250px]">
                                <Bar data={barChartData} options={chartOptions} />
                            </div>
                        </div>

                        {/* Line Chart - Progress */}
                        <div className="glass-panel p-8 border-amber-500/20 border-2 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/50 to-transparent"></div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                    <ShowChartIcon sx={{ fontSize: 24, color: '#f59e0b' }} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Progress Timeline</h3>
                                    <p className="text-xs text-zinc-400 uppercase tracking-wider">Line Chart</p>
                                </div>
                            </div>
                            <div className="h-[250px]">
                                {currentStats.progressData.length > 1 ? (
                                    <Line data={lineChartData} options={chartOptions} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                                        <ShowChartIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
                                        <p className="text-sm">Complete more tasks to see progress</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pie Chart - Distribution */}
                        <div className="glass-panel p-8 border-emerald-500/20 border-2 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/50 to-transparent"></div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                    <TrendingUpIcon sx={{ fontSize: 24, color: '#34d399' }} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Task Distribution</h3>
                                    <p className="text-xs text-zinc-400 uppercase tracking-wider">Pie Chart</p>
                                </div>
                            </div>
                            <div className="h-[250px] flex items-center justify-center">
                                <Pie data={pieChartData} options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: 'bottom', labels: { color: '#a1a1aa', font: { size: 11 } } }
                                    }
                                }} />
                            </div>
                        </div>

                        {/* Doughnut Chart - Completion */}
                        <div className="glass-panel p-8 border-blue-500/20 border-2 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/50 to-transparent"></div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                    <AssignmentIcon sx={{ fontSize: 24, color: '#60a5fa' }} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Task Completion</h3>
                                    <p className="text-xs text-zinc-400 uppercase tracking-wider">Doughnut Chart</p>
                                </div>
                            </div>
                            <div className="h-[250px] flex items-center justify-center">
                                <Doughnut data={doughnutChartData} options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: 'bottom', labels: { color: '#a1a1aa', font: { size: 11 } } }
                                    }
                                }} />
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Empty State */}
            {!currentStudent && filteredStudents.length === 0 && (
                <div className="glass-panel p-16 text-center border-2 border-dashed border-white/5">
                    <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-6">
                        <AssessmentIcon sx={{ fontSize: 48, color: '#71717a' }} />
                    </div>
                    <h3 className="text-xl font-serif text-white mb-2">No Students Available</h3>
                    <p className="text-zinc-500 text-sm max-w-md mx-auto">
                        {userMode === 'teacher'
                            ? 'Add students to your groups to start tracking their progress.'
                            : 'Your statistics will appear here once you complete some tasks.'
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default StatsDashboard;
