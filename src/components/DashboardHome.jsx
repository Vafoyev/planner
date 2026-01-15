import React, { useMemo } from 'react';
import { format, startOfWeek, startOfMonth, startOfYear, isWithinInterval } from 'date-fns';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardHome = ({ userMode, students = [], tasks = {} }) => {
  // Calculate Statistics
  const stats = useMemo(() => {
    const allTasks = Object.values(tasks).flat();
    const completedTasks = students.reduce((total, student) => {
      return total + Object.keys(student.scores || {}).length;
    }, 0);
    
    // Calculate overall scores
    let totalScore = 0;
    let totalMax = 0;
    students.forEach(student => {
      Object.entries(student.scores || {}).forEach(([taskId, score]) => {
        const task = allTasks.find(t => t.id === Number(taskId));
        if (task) {
          totalScore += score;
          totalMax += (task.maxScore || 40);
        }
      });
    });
    
    const averageScore = totalMax > 0 ? ((totalScore / totalMax) * 100).toFixed(1) : 0;
    
    // Weekly stats
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekTasks = Object.entries(tasks).reduce((acc, [day, dayTasks]) => {
      return acc + dayTasks.length;
    }, 0);
    
    // Monthly stats
    const monthStart = startOfMonth(now);
    
    return {
      totalStudents: students.length,
      totalTasks: allTasks.length,
      completedTasks,
      averageScore,
      weekTasks,
      pendingTasks: allTasks.length - completedTasks
    };
  }, [students, tasks]);

  // Pie Chart Data for Tasks Distribution
  const taskDistributionData = {
    labels: ['Completed', 'Pending'],
    datasets: [{
      label: 'Tasks Status',
      data: [stats.completedTasks, stats.pendingTasks],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
      ],
      borderColor: [
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
      ],
      borderWidth: 2,
    }],
  };

  // Skill Distribution Pie Chart
  const skillDistributionData = {
    labels: ['Listening', 'Reading', 'Writing', 'Speaking', 'Mock Test'],
    datasets: [{
      label: 'Tasks by Skill',
      data: [
        tasks.Monday?.length || 0,
        tasks.Tuesday?.length || 0,
        tasks.Wednesday?.length || 0,
        tasks.Thursday?.length || 0,
        tasks.Friday?.length || 0,
      ],
      backgroundColor: [
        'rgba(139, 92, 246, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(236, 72, 153, 0.8)',
      ],
      borderColor: [
        'rgba(139, 92, 246, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(236, 72, 153, 1)',
      ],
      borderWidth: 2,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#a1a1aa',
          font: {
            size: 12,
            family: 'Inter, sans-serif'
          },
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(23, 23, 23, 0.95)',
        titleColor: '#fff',
        bodyColor: '#a1a1aa',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
      },
    },
  };

  return (
    <div className="dashboard-home">
      {/* Welcome Header */}
      <header className="page-glass-header mb-8">
        <div className="header-icon-glass">
          <DashboardIcon sx={{ fontSize: 28, color: '#f59e0b' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-serif text-white mb-2">
            Welcome {userMode === 'teacher' ? 'Teacher' : 'Student'}!
          </h2>
          <p className="text-sm text-zinc-400 font-sans">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} • Here's your overview
          </p>
        </div>
        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-6 py-3 rounded-xl border border-amber-500/30">
          <StarIcon sx={{ fontSize: 24, color: '#f59e0b' }} />
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider">Average Score</p>
            <p className="text-2xl font-bold text-amber-400">{stats.averageScore}%</p>
          </div>
        </div>
      </header>

      {/* Quick Stats Cards */}
      <div className="summary-grid mb-8">
        <div className="glass-panel p-6 hover:scale-105 transition-transform cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform">
              <PeopleIcon sx={{ fontSize: 28, color: '#a78bfa' }} />
            </div>
            <div>
              <p className="text-sm text-zinc-400 uppercase tracking-wider mb-1">Total Students</p>
              <p className="text-3xl font-bold text-white">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 hover:scale-105 transition-transform cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform">
              <AssignmentIcon sx={{ fontSize: 28, color: '#60a5fa' }} />
            </div>
            <div>
              <p className="text-sm text-zinc-400 uppercase tracking-wider mb-1">Total Tasks</p>
              <p className="text-3xl font-bold text-white">{stats.totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 hover:scale-105 transition-transform cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
              <TrendingUpIcon sx={{ fontSize: 28, color: '#34d399' }} />
            </div>
            <div>
              <p className="text-sm text-zinc-400 uppercase tracking-wider mb-1">Completed</p>
              <p className="text-3xl font-bold text-white">{stats.completedTasks}</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 hover:scale-105 transition-transform cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 group-hover:scale-110 transition-transform">
              <CalendarTodayIcon sx={{ fontSize: 28, color: '#fbbf24' }} />
            </div>
            <div>
              <p className="text-sm text-zinc-400 uppercase tracking-wider mb-1">This Week</p>
              <p className="text-3xl font-bold text-white">{stats.weekTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Task Status Pie Chart */}
        <div className="glass-panel p-8 border-purple-500/20 border-2">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <EmojiEventsIcon sx={{ fontSize: 24, color: '#a78bfa' }} />
            </div>
            <div>
              <h3 className="font-semibold text-xl text-white font-serif">Task Completion</h3>
              <p className="text-xs text-zinc-400 uppercase tracking-wider mt-1">Overall progress</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={taskDistributionData} options={chartOptions} />
          </div>
        </div>

        {/* Skill Distribution Pie Chart */}
        <div className="glass-panel p-8 border-amber-500/20 border-2">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
              <MenuBookIcon sx={{ fontSize: 24, color: '#f59e0b' }} />
            </div>
            <div>
              <h3 className="font-semibold text-xl text-white font-serif">Skills Distribution</h3>
              <p className="text-xs text-zinc-400 uppercase tracking-wider mt-1">Tasks by skill type</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Pie data={skillDistributionData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Quick Actions for Teacher */}
      {userMode === 'teacher' && students.length > 0 && (
        <div className="glass-panel p-8">
          <h3 className="text-xl font-serif text-white mb-6 flex items-center gap-3">
            <SchoolIcon sx={{ fontSize: 24, color: '#f59e0b' }} />
            Recent Students
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.slice(0, 6).map((student) => {
              const studentScores = Object.values(student.scores || {});
              const avgScore = studentScores.length > 0
                ? (studentScores.reduce((a, b) => a + b, 0) / studentScores.length).toFixed(1)
                : 0;
              
              return (
                <div key={student.id} className="bg-black/20 p-4 rounded-xl border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold truncate">{student.name}</h4>
                      <p className="text-xs text-zinc-400">{studentScores.length} tasks completed</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 uppercase">Avg Score</span>
                    <span className="text-lg font-bold text-amber-400">{avgScore}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
