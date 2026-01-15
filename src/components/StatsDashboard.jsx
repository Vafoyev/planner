import React from 'react';
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
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { useState, useMemo } from 'react';
import { format, startOfWeek, startOfMonth, isWithinInterval, parseISO, subWeeks, subMonths } from 'date-fns';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import StarIcon from '@mui/icons-material/Star';
import TimelineIcon from '@mui/icons-material/Timeline';

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
    { name: 'Listening', key: 'Listening', color: '#3b82f6' }, // Blue
    { name: 'Reading', key: 'Reading', color: '#10b981' }, // Green
    { name: 'Writing', key: 'Writing', color: '#f59e0b' }, // Amber
    { name: 'Speaking', key: 'Speaking', color: '#ef4444' }, // Red
    { name: 'Vocabulary', key: 'Vocabulary', color: '#8b5cf6' }, // Purple
    { name: 'Grammar', key: 'Grammar', color: '#ec4899' }, // Pink
];

// Reusable Summary Card Component
const SummaryCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="glass-panel summary-card">
        <div className="summary-icon-wrapper" style={{ background: `${color}20`, color: color }}>
            <Icon sx={{ fontSize: 24 }} />
        </div>
        <div className="summary-content">
            <p className="summary-title">{title}</p>
            <h3 className="summary-value" style={{ color: value === '—' ? '#71717a' : 'white' }}>{value}</h3>
            {subtitle && <p className="summary-subtitle">{subtitle}</p>}
        </div>
    </div>
);

const StatsDashboard = ({ students, selectedStudent, tasks = {} }) => {
    const [timePeriod, setTimePeriod] = useState('overall'); // 'weekly', 'monthly', 'overall'

    // Filter tasks by time period
    const getTasksByPeriod = (tasks, period) => {
        const now = new Date();
        let startDate;
        
        if (period === 'weekly') {
            startDate = startOfWeek(subWeeks(now, 0), { weekStartsOn: 1 });
        } else if (period === 'monthly') {
            startDate = startOfMonth(subMonths(now, 0));
        } else {
            return tasks; // overall - return all
        }
        
        const filtered = {};
        Object.entries(tasks).forEach(([day, dayTasks]) => {
            filtered[day] = dayTasks.filter(task => {
                if (!task.date) return true;
                const taskDate = parseISO(task.date);
                return isWithinInterval(taskDate, { start: startDate, end: now });
            });
        });
        return filtered;
    };

    const getStudentStats = (student) => {
        if (!student) return null;
        
        const filteredTasks = getTasksByPeriod(tasks, timePeriod);
        let totalScore = 0;
        let totalMax = 0;
        let skillScores = { Listening: { s: 0, m: 0 }, Reading: { s: 0, m: 0 }, Writing: { s: 0, m: 0 }, Speaking: { s: 0, m: 0 }, Vocabulary: { s: 0, m: 0 }, Grammar: { s: 0, m: 0 } };
        let progressData = [];
        let progressLabels = [];
        let completedTasks = 0;
        let totalTasks = 0;

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        days.forEach(day => {
            const dayTasks = filteredTasks[day] || [];
            dayTasks.forEach((task, i) => {
                totalTasks++;
                
                // Map day to skill
                let skill = 'General';
                if (day === 'Monday') skill = 'Listening';
                else if (day === 'Tuesday') skill = 'Reading';
                else if (day === 'Wednesday') skill = 'Writing';
                else if (day === 'Thursday') skill = 'Speaking';
                else if (day === 'Friday') skill = i % 2 === 0 ? 'Vocabulary' : 'Grammar';
                else if (day === 'Saturday') skill = 'Speaking';
                else if (day === 'Sunday') skill = 'Vocabulary';

                const score = student.scores?.[task.id] || 0;
                const max = task.maxScore || 40;

                if (score > 0) {
                    completedTasks++;
                    totalScore += score;
                    totalMax += max;

                    if (skillScores[skill]) {
                        skillScores[skill].s += score;
                        skillScores[skill].m += max;
                    }

                    const pct = (score / max) * 100;
                    // Band Score calculation
                    let band = 0;
                    if (pct >= 89) band = 9.0;
                    else if (pct >= 84) band = 8.5;
                    else if (pct >= 78) band = 8.0;
                    else if (pct >= 73) band = 7.5;
                    else if (pct >= 67) band = 7.0;
                    else if (pct >= 60) band = 6.5;
                    else if (pct >= 53) band = 6.0;
                    else if (pct >= 47) band = 5.5;
                    else if (pct >= 40) band = 5.0;
                    else if (pct >= 33) band = 4.5;
                    else if (pct >= 27) band = 4.0;
                    else if (pct >= 20) band = 3.5;
                    else if (pct >= 13) band = 3.0;
                    else band = 2.5;

                    progressData.push(band);
                    const taskDate = task.date ? format(parseISO(task.date), 'MMM d') : day.substring(0, 3);
                    progressLabels.push(`${taskDate}`);
                }
            });
        });

        // Skill Bands
        const skillBands = SKILLS.map(s => {
            const data = skillScores[s.key];
            if (!data || data.m === 0) return 0;
            const pct = (data.s / data.m) * 100;
            if (pct >= 89) return 9.0;
            else if (pct >= 84) return 8.5;
            else if (pct >= 78) return 8.0;
            else if (pct >= 73) return 7.5;
            else if (pct >= 67) return 7.0;
            else if (pct >= 60) return 6.5;
            else if (pct >= 53) return 6.0;
            else if (pct >= 47) return 5.5;
            else if (pct >= 40) return 5.0;
            else if (pct >= 33) return 4.5;
            else if (pct >= 27) return 4.0;
            else if (pct >= 20) return 3.5;
            else if (pct >= 13) return 3.0;
            else return 2.5;
        });

        const overallPct = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
        let overallBand = 0;
        if (overallPct >= 89) overallBand = 9.0;
        else if (overallPct >= 84) overallBand = 8.5;
        else if (overallPct >= 78) overallBand = 8.0;
        else if (overallPct >= 73) overallBand = 7.5;
        else if (overallPct >= 67) overallBand = 7.0;
        else if (overallPct >= 60) overallBand = 6.5;
        else if (overallPct >= 53) overallBand = 6.0;
        else if (overallPct >= 47) overallBand = 5.5;
        else if (overallPct >= 40) overallBand = 5.0;
        else if (overallPct >= 33) overallBand = 4.5;
        else if (overallPct >= 27) overallBand = 4.0;
        else if (overallPct >= 20) overallBand = 3.5;
        else if (overallPct >= 13) overallBand = 3.0;
        else overallBand = 2.5;

        return {
            overallBand,
            skillBands,
            progressData,
            progressLabels,
            completedTasks,
            totalTasks,
            participation: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
            skillScores
        };
    };

    const currentStats = useMemo(() => {
        return selectedStudent
            ? getStudentStats(selectedStudent)
            : { overallBand: 0, skillBands: [0, 0, 0, 0, 0, 0], progressData: [], participation: 0, completedTasks: 0, totalTasks: 0, skillScores: {} };
    }, [selectedStudent, tasks, timePeriod]);


    // Chart Configs
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(23, 23, 23, 0.9)',
                titleColor: '#fff',
                bodyColor: '#a1a1aa',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: (ctx) => `Band Score: ${ctx.raw}`
                }
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

    const barChartData = {
        labels: SKILLS.map(s => s.name),
        datasets: [{
            data: currentStats.skillBands,
            backgroundColor: SKILLS.map(s => s.color + 'CC'),
            borderRadius: 6,
            barThickness: 30,
        }]
    };

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
            pointHoverRadius: 6
        }]
    };

    if (!selectedStudent && students.length > 0) {
        return (
            <div className="glass-panel p-16 text-center border-2 border-dashed border-white/5">
                <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-6">
                    <AssessmentIcon sx={{ fontSize: 48, color: '#71717a' }} />
                </div>
                <h3 className="text-xl font-serif text-white mb-2">Select a Student</h3>
                <p className="text-zinc-500 text-sm max-w-md mx-auto">
                    Choose a student from the list to view their detailed performance analytics and progress insights.
                </p>
            </div>
        );
    }

    if (!selectedStudent) return (
        <div className="glass-panel p-16 text-center border-2 border-dashed border-white/5">
            <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-6">
                <AssessmentIcon sx={{ fontSize: 48, color: '#71717a' }} />
            </div>
            <h3 className="text-xl font-serif text-white mb-2">No Students Available</h3>
            <p className="text-zinc-500 text-sm max-w-md mx-auto">
                Add students from the Students section to start tracking their progress.
            </p>
        </div>
    );

    return (
        <div className="stats-dashboard">
            {/* Header */}
            <header className="page-glass-header mb-8">
                <div className="header-icon-glass">
                    <DashboardIcon sx={{ fontSize: 28, color: '#f59e0b' }} />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-serif text-white mb-1">{selectedStudent.name}'s Statistics</h2>
                    <p className="text-sm text-zinc-400 font-sans">Performance analytics and insights</p>
                </div>
                
                {/* Time Period Selector */}
                <div className="flex items-center gap-2 bg-black/20 rounded-full p-1 border border-white/5 mr-4">
                    <button
                        onClick={() => setTimePeriod('weekly')}
                        className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                            timePeriod === 'weekly'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => setTimePeriod('monthly')}
                        className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                            timePeriod === 'monthly'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setTimePeriod('overall')}
                        className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                            timePeriod === 'overall'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        Overall
                    </button>
                </div>

                <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-6 py-3 rounded-xl border border-amber-500/30 shadow-lg shadow-amber-900/20">
                    <StarIcon sx={{ fontSize: 20, color: '#f59e0b' }} />
                    <div className="text-right">
                        <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Overall Band</p>
                        <p className="text-2xl font-bold text-amber-400">{currentStats.overallBand > 0 ? currentStats.overallBand.toFixed(1) : '—'}</p>
                    </div>
                </div>
            </header>

            {/* 1. Summary Cards Row */}
            <div className="summary-grid">
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
                    subtitle={`Total: ${currentStats.totalTasks}`}
                    icon={AssignmentIcon}
                    color="#3b82f6"
                />
                <SummaryCard
                    title="Attendance"
                    value={`${currentStats.participation}%`}
                    subtitle="Participation rate"
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

            {/* 2. Charts Row */}
            <div className="charts-grid mt-8 gap-6">
                <div className="glass-panel p-8 h-[450px] flex flex-col border-purple-500/20 border-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                            <AssessmentIcon sx={{ fontSize: 24, color: '#a78bfa' }} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-xl text-white font-serif">Skill Breakdown</h3>
                            <p className="text-xs text-zinc-400 uppercase tracking-wider mt-1">Performance by skill area (Bar Chart)</p>
                        </div>
                    </div>
                    <div className="flex-1 relative">
                        <Bar data={barChartData} options={chartOptions} />
                    </div>
                </div>

                <div className="glass-panel p-8 h-[450px] flex flex-col border-amber-500/20 border-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/50 to-transparent"></div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                            <ShowChartIcon sx={{ fontSize: 24, color: '#f59e0b' }} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-xl text-white font-serif">Progress Timeline</h3>
                            <p className="text-xs text-zinc-400 uppercase tracking-wider mt-1">Learning journey over time (Line Chart)</p>
                        </div>
                    </div>
                    <div className="flex-1 relative">
                        {currentStats.progressData.length > 1 ? (
                            <Line data={lineChartData} options={chartOptions} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                                <ShowChartIcon sx={{ fontSize: 48, color: '#475569', mb: 2 }} />
                                <p className="text-sm">Not enough data to show trend</p>
                                <p className="text-xs text-zinc-600 mt-1">Complete more tasks to see your progress</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Pie Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Skill Distribution Pie Chart */}
                <div className="glass-panel p-8 border-emerald-500/20 border-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/50 to-transparent"></div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                            <TrendingUpIcon sx={{ fontSize: 24, color: '#34d399' }} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-xl text-white font-serif">Skills Distribution</h3>
                            <p className="text-xs text-zinc-400 uppercase tracking-wider mt-1">Tasks by skill type (Pie Chart)</p>
                        </div>
                    </div>
                    <div className="h-64 flex items-center justify-center">
                        <Pie 
                            data={{
                                labels: SKILLS.map(s => s.name),
                                datasets: [{
                                    label: 'Tasks by Skill',
                                    data: SKILLS.map(s => {
                                        const dayMapping = {
                                            'Listening': 'Monday',
                                            'Reading': 'Tuesday',
                                            'Writing': 'Wednesday',
                                            'Speaking': 'Thursday',
                                            'Vocabulary': 'Friday',
                                            'Grammar': 'Friday'
                                        };
                                        const day = dayMapping[s.key];
                                        const filtered = getTasksByPeriod(tasks, timePeriod);
                                        return (filtered[day] || []).length;
                                    }),
                                    backgroundColor: SKILLS.map(s => s.color + 'CC'),
                                    borderColor: SKILLS.map(s => s.color),
                                    borderWidth: 2,
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: true,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: {
                                            color: '#a1a1aa',
                                            font: { size: 11, family: 'Inter' },
                                            padding: 12,
                                        },
                                    },
                                    tooltip: {
                                        backgroundColor: 'rgba(23, 23, 23, 0.95)',
                                        titleColor: '#fff',
                                        bodyColor: '#a1a1aa',
                                        borderColor: 'rgba(255, 255, 255, 0.1)',
                                        borderWidth: 1,
                                        padding: 12,
                                    },
                                },
                            }}
                        />
                    </div>
                </div>

                {/* Task Completion Doughnut Chart */}
                <div className="glass-panel p-8 border-blue-500/20 border-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/50 to-transparent"></div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                            <AssignmentIcon sx={{ fontSize: 24, color: '#60a5fa' }} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-xl text-white font-serif">Task Completion</h3>
                            <p className="text-xs text-zinc-400 uppercase tracking-wider mt-1">Progress overview (Doughnut Chart)</p>
                        </div>
                    </div>
                    <div className="h-64 flex items-center justify-center">
                        <Doughnut
                            data={{
                                labels: ['Completed', 'Pending'],
                                datasets: [{
                                    label: 'Tasks Status',
                                    data: [
                                        currentStats.completedTasks,
                                        Math.max(0, currentStats.totalTasks - currentStats.completedTasks)
                                    ],
                                    backgroundColor: [
                                        'rgba(16, 185, 129, 0.8)',
                                        'rgba(245, 158, 11, 0.8)',
                                    ],
                                    borderColor: [
                                        'rgba(16, 185, 129, 1)',
                                        'rgba(245, 158, 11, 1)',
                                    ],
                                    borderWidth: 2,
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: true,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: {
                                            color: '#a1a1aa',
                                            font: { size: 11, family: 'Inter' },
                                            padding: 12,
                                        },
                                    },
                                    tooltip: {
                                        backgroundColor: 'rgba(23, 23, 23, 0.95)',
                                        titleColor: '#fff',
                                        bodyColor: '#a1a1aa',
                                        borderColor: 'rgba(255, 255, 255, 0.1)',
                                        borderWidth: 1,
                                        padding: 12,
                                        callbacks: {
                                            label: (context) => {
                                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                                            }
                                        }
                                    },
                                },
                            }}
                        />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default StatsDashboard;
