import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
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

const StatsDashboard = ({ students, selectedStudent }) => {
    // ... Data logic kept similar, but refined ...

    const getStudentStats = (student) => {
        if (!student) return null;
        let totalScore = 0;
        let totalMax = 0;
        let skillScores = { Listening: { s: 0, m: 0 }, Reading: { s: 0, m: 0 }, Writing: { s: 0, m: 0 }, Speaking: { s: 0, m: 0 }, Vocabulary: { s: 0, m: 0 }, Grammar: { s: 0, m: 0 } };
        let progressData = [];
        let progressLabels = [];
        let completedTasks = 0;
        let totalTasks = 0;

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        days.forEach(day => {
            const tasks = student.tasks?.[day] || [];
            tasks.forEach((task, i) => {
                totalTasks++;
                const outputTasks = JSON.parse(localStorage.getItem('ielts_academy_v4') || '{}').tasks?.[day] || [];
                // Find meta for skill
                let skill = 'General';
                if (i < outputTasks.length) {
                    // Assuming tasks are in order, or we need a better mapping. 
                    // For now, let's look up the skill by task ID or index if possible. 
                    // Since we don't have task definitions here easily without props props drilling, 
                    // we'll infer/mock or use what we have. 
                    // Actually, we need to pass 'tasks' prop or logic to get skill map.
                    // Fallback: Use task key/id to determine? 
                    // Simplified: Just use day mapping from ScheduleView if we had it.
                    // FIX: Let's assume SKILLS map to Days for simplicity as in Schedule:
                    // Mon: Listening, Tue: Reading, Wed: Writing, Thu: Speaking, Fri: Vocab/Grammar
                }

                // MAPPING logic matches ScheduleView
                if (day === 'Monday') skill = 'Listening';
                if (day === 'Tuesday') skill = 'Reading';
                if (day === 'Wednesday') skill = 'Writing';
                if (day === 'Thursday') skill = 'Speaking';
                if (day === 'Friday') skill = i % 2 === 0 ? 'Vocabulary' : 'Grammar';

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
                    // Simple Band Calc
                    let band = 0;
                    if (pct >= 89) band = 9.0;
                    else if (pct >= 78) band = 8.0;
                    else if (pct >= 67) band = 7.0;
                    else if (pct >= 53) band = 6.0;
                    else if (pct >= 40) band = 5.0;
                    else if (pct >= 27) band = 4.0;
                    else band = 3.0;

                    progressData.push(band);
                    progressLabels.push(`${day.substring(0, 3)} #${i + 1}`);
                }
            });
        });

        // Skill Bands
        const skillBands = SKILLS.map(s => {
            const data = skillScores[s.key];
            if (!data || data.m === 0) return 0;
            const pct = (data.s / data.m) * 100;
            if (pct >= 89) return 9.0;
            if (pct >= 78) return 8.0;
            if (pct >= 67) return 7.0;
            if (pct >= 53) return 6.0;
            if (pct >= 40) return 5.0;
            else return 4.0;
        });

        const overallPct = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
        let overallBand = 0;
        if (overallPct >= 89) overallBand = 9.0;
        else if (overallPct >= 78) overallBand = 8.0;
        else if (overallPct >= 67) overallBand = 7.0;
        else if (overallPct >= 53) overallBand = 6.0;
        else if (overallPct >= 40) overallBand = 5.0;
        else overallBand = 4.0;

        return {
            overallBand,
            skillBands,
            progressData,
            progressLabels,
            completedTasks,
            totalTasks,
            participation: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        };
    };

    const currentStats = selectedStudent
        ? getStudentStats(selectedStudent)
        : { overallBand: 0, skillBands: [0, 0, 0, 0, 0, 0], progressData: [], participation: 0, completedTasks: 0 };


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
            <div className="empty-dashboard glass-panel">
                <AssessmentIcon sx={{ fontSize: 64, color: 'var(--text-muted)' }} />
                <h3>Select a Student</h3>
                <p>Choose a student to view their detailed performance analytics.</p>
            </div>
        );
    }

    if (!selectedStudent) return <div className="glass-panel p-8 text-center">No students available.</div>;

    return (
        <div className="stats-dashboard">
            {/* Header */}
            <header className="page-glass-header mb-8">
                <div className="header-icon-glass">
                    <DashboardIcon sx={{ fontSize: 28, color: '#f59e0b' }} />
                </div>
                <div>
                    <h2>{selectedStudent.name}'s Analytics</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Real-time performance metrics</p>
                </div>
                <div className="header-badge" style={{ marginLeft: 'auto', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '8px 16px', borderRadius: '20px' }}>
                    <StarIcon sx={{ fontSize: 16, marginBottom: '2px', marginRight: '4px' }} />
                    Overall Band: <strong>{currentStats.overallBand.toFixed(1)}</strong>
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
            <div className="charts-grid mt-8">
                <div className="glass-panel p-6 h-96 flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <AssessmentIcon sx={{ color: '#8b5cf6' }} />
                        <h3 className="font-semibold text-lg">Skill Breakdown</h3>
                    </div>
                    <div className="flex-1 relative">
                        <Bar data={barChartData} options={chartOptions} />
                    </div>
                </div>

                <div className="glass-panel p-6 h-96 flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <ShowChartIcon sx={{ color: '#f59e0b' }} />
                        <h3 className="font-semibold text-lg">Progress Timeline</h3>
                    </div>
                    <div className="flex-1 relative">
                        {currentStats.progressData.length > 1 ? (
                            <Line data={lineChartData} options={chartOptions} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-zinc-500">
                                Not enough data to show trend
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default StatsDashboard;
