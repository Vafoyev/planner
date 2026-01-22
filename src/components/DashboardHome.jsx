import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

const DashboardHome = ({ userMode, user, students = [], tasks = {}, groups = [] }) => {
  // Calculate stats
  const totalTasks = Object.values(tasks).flat().length;
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayTasks = tasks[todayName] || [];

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // For students - get their assigned tasks
  const getStudentStats = () => {
    if (user?.role !== 'student') return null;

    let totalAssigned = 0;
    let completed = 0;

    Object.values(tasks).forEach(dayTasks => {
      dayTasks.forEach(task => {
        totalAssigned++;
        // Check if scored (simplified)
      });
    });

    return { totalAssigned, completed };
  };

  const studentStats = getStudentStats();

  return (
    <div className="dashboard-home">
      {/* Welcome Header */}
      <header className="glass-panel p-6 md:p-8 mb-6 md:mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
            {userMode === 'teacher' ? (
              <SchoolIcon sx={{ fontSize: 32 }} className="md:!text-[40px] text-white" />
            ) : (
              <PersonIcon sx={{ fontSize: 32 }} className="md:!text-[40px] text-white" />
            )}
          </div>
          <div>
            <p className="text-xs md:text-sm uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>{getGreeting()}</p>
            <h1 className="text-2xl md:text-3xl font-serif font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {user?.name || 'User'}
            </h1>
            <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
              {user?.role === 'headteacher' && 'Head Teacher • Full Access'}
              {user?.role === 'teacher' && 'Teacher • Group Management'}
              {user?.role === 'student' && 'Student • Learning Mode'}
            </p>
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {userMode === 'teacher' ? (
          <>
            <StatCard
              title="Total Students"
              value={students.length}
              subtitle="In your groups"
              icon={GroupIcon}
              color="#8b5cf6"
            />
            <StatCard
              title="Active Groups"
              value={groups.length}
              subtitle="Managed by you"
              icon={SchoolIcon}
              color="#3b82f6"
            />
            <StatCard
              title="Total Tasks"
              value={totalTasks}
              subtitle="Created this period"
              icon={AssignmentIcon}
              color="#f59e0b"
            />
            <StatCard
              title="Today's Tasks"
              value={todayTasks.length}
              subtitle={todayName}
              icon={CalendarTodayIcon}
              color="#10b981"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Assigned Tasks"
              value={totalTasks}
              subtitle="Total tasks"
              icon={AssignmentIcon}
              color="#f59e0b"
            />
            <StatCard
              title="Today's Tasks"
              value={todayTasks.length}
              subtitle={todayName}
              icon={CalendarTodayIcon}
              color="#3b82f6"
            />
            <StatCard
              title="My Groups"
              value={groups.filter(g => g.studentIds?.includes(user?.id)).length}
              subtitle="Enrolled in"
              icon={GroupIcon}
              color="#8b5cf6"
            />
            <StatCard
              title="My Teacher"
              value={groups.find(g => g.studentIds?.includes(user?.id))?.teacherId ? '1' : '0'}
              subtitle="Assigned"
              icon={SchoolIcon}
              color="#10b981"
            />
          </>
        )}
      </div>

      {/* Today's Tasks Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <CalendarTodayIcon sx={{ fontSize: 20, color: '#f59e0b' }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Today's Schedule</h3>
              <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{todayName}</p>
            </div>
          </div>

          {todayTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircleIcon sx={{ fontSize: 48, color: '#10b981', opacity: 0.5, mb: 2 }} />
              <p style={{ color: 'var(--text-secondary)' }}>No tasks scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.slice(0, 4).map((task, index) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-4 rounded-xl border transition-colors"
                  style={{
                    backgroundColor: 'var(--glass-bg)',
                    borderColor: 'var(--glass-border)'
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <AccessTimeIcon sx={{ fontSize: 12 }} />
                        {task.deadline || 'No deadline'}
                      </span>
                      <span className="text-xs text-amber-500">
                        {task.maxScore} points
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {todayTasks.length > 4 && (
                <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  +{todayTasks.length - 4} more tasks
                </p>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions / Recent Activity */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <TrendingUpIcon sx={{ fontSize: 20, color: '#10b981' }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
              <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Get started</p>
            </div>
          </div>

          <div className="space-y-3">
            {userMode === 'teacher' ? (
              <>
                <ActionButton
                  icon={GroupIcon}
                  title="Manage Groups"
                  description="Create and organize study groups"
                  color="purple"
                />
                <ActionButton
                  icon={AssignmentIcon}
                  title="Create Task"
                  description="Add new assignments for students"
                  color="amber"
                />
                <ActionButton
                  icon={TrendingUpIcon}
                  title="View Statistics"
                  description="Analyze student performance"
                  color="emerald"
                />
              </>
            ) : (
              <>
                <ActionButton
                  icon={AssignmentIcon}
                  title="View My Tasks"
                  description="Check your assigned work"
                  color="amber"
                />
                <ActionButton
                  icon={TrendingUpIcon}
                  title="My Progress"
                  description="See your learning statistics"
                  color="emerald"
                />
                <ActionButton
                  icon={CalendarTodayIcon}
                  title="Weekly Schedule"
                  description="Plan your study time"
                  color="blue"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <div className="glass-panel p-6 flex items-center gap-4 hover:border-white/20 transition-colors">
    <div
      className="w-14 h-14 rounded-xl flex items-center justify-center"
      style={{ backgroundColor: `${color}20` }}
    >
      <Icon sx={{ fontSize: 28, color }} />
    </div>
    <div>
      <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{title}</p>
      {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
    </div>
  </div>
);

// Action Button Component
const ActionButton = ({ icon: Icon, title, description, color }) => {
  const colors = {
    purple: 'from-purple-500 to-violet-600',
    amber: 'from-amber-500 to-orange-600',
    emerald: 'from-emerald-500 to-teal-600',
    blue: 'from-blue-500 to-cyan-600'
  };

  return (
    <button className="w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group"
      style={{
        backgroundColor: 'var(--glass-bg)',
        borderColor: 'var(--glass-border)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--glass-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--glass-bg)';
      }}
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon sx={{ fontSize: 24 }} />
      </div>
      <div>
        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{title}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{description}</p>
      </div>
    </button>
  );
};

export default DashboardHome;
