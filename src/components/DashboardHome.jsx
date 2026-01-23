import React from 'react';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import EditNoteIcon from '@mui/icons-material/EditNote';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Skills
const SKILLS = [
  { name: 'Listening', icon: HeadphonesIcon, gradient: 'linear-gradient(135deg, #A78BFA, #7C3AED)', shadow: 'rgba(167, 139, 250, 0.4)' },
  { name: 'Reading', icon: AutoStoriesIcon, gradient: 'linear-gradient(135deg, #60A5FA, #2563EB)', shadow: 'rgba(96, 165, 250, 0.4)' },
  { name: 'Writing', icon: EditNoteIcon, gradient: 'linear-gradient(135deg, #34D399, #059669)', shadow: 'rgba(52, 211, 153, 0.4)' },
  { name: 'Speaking', icon: RecordVoiceOverIcon, gradient: 'linear-gradient(135deg, #FB923C, #EA580C)', shadow: 'rgba(251, 146, 60, 0.4)' },
];

const DashboardHome = ({ userMode, user, students = [], tasks = {}, groups = [] }) => {
  const totalTasks = Object.values(tasks).flat().length;
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayTasks = tasks[todayName] || [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getMotivationalQuote = () => {
    const quotes = [
      "The limits of my language mean the limits of my world.",
      "One language sets you in a corridor for life.",
      "Learning another language is like becoming another person.",
      "Language is the road map of a culture.",
      "To have another language is to possess a second soul."
    ];
    return quotes[new Date().getDate() % quotes.length];
  };

  const getRoleBadge = () => {
    if (user?.role === 'headteacher') return { bg: 'var(--listening-bg)', color: 'var(--listening)', border: 'var(--listening-border)', label: 'Head Teacher' };
    if (user?.role === 'teacher') return { bg: 'var(--reading-bg)', color: 'var(--reading)', border: 'var(--reading-border)', label: 'Teacher' };
    return { bg: 'var(--writing-bg)', color: 'var(--writing)', border: 'var(--writing-border)', label: 'Student' };
  };

  const badge = getRoleBadge();

  return (
    <div style={{ animation: 'fadeIn 0.4s ease forwards' }}>
      {/* Welcome Header */}
      <div style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Skill Gradient Bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, var(--listening), var(--reading), var(--writing), var(--speaking))'
        }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 32px rgba(59, 130, 246, 0.35)'
            }}>
              {userMode === 'teacher' ? (
                <SchoolIcon sx={{ fontSize: 36, color: 'white' }} />
              ) : (
                <PersonIcon sx={{ fontSize: 36, color: 'white' }} />
              )}
            </div>
            <div style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--success)',
              border: '3px solid var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircleIcon sx={{ fontSize: 12, color: 'white' }} />
            </div>
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <p style={{
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontWeight: 600,
              color: 'var(--primary-400)',
              marginBottom: '8px'
            }}>
              {getGreeting()} 👋
            </p>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(24px, 5vw, 36px)',
              fontWeight: 700,
              color: 'var(--text-default)',
              marginBottom: '12px',
              letterSpacing: '-0.02em'
            }}>
              {user?.name || 'User'}
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '100px',
                fontSize: '12px',
                fontWeight: 600,
                background: badge.bg,
                color: badge.color,
                border: `1px solid ${badge.border}`
              }}>
                <StarIcon sx={{ fontSize: 12 }} />
                {badge.label}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-subtle)' }}>• Learning Platform</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { value: totalTasks, label: 'Tasks' },
              { value: students.length, label: 'Students' },
              { value: groups.length, label: 'Groups' }
            ].map((stat, i) => (
              <div key={i} style={{
                textAlign: 'center',
                padding: '12px 20px',
                borderRadius: '16px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid var(--primary-500)',
                minWidth: '80px'
              }}>
                <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary-400)' }}>{stat.value}</p>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-default)' }}>
          <p style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--text-subtle)' }}>"{getMotivationalQuote()}"</p>
        </div>
      </div>

      {/* Skills */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--text-default)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <EmojiEventsIcon sx={{ fontSize: 22, color: 'var(--accent-500)' }} />
          Skills Overview
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          {SKILLS.map((skill, i) => {
            const Icon = skill.icon;
            return (
              <div key={skill.name} style={{
                background: 'var(--surface-default)',
                border: '1px solid var(--border-default)',
                borderRadius: '20px',
                padding: '24px 20px',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: skill.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: `0 8px 24px ${skill.shadow}`
                }}>
                  <Icon sx={{ fontSize: 26, color: 'white' }} />
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-default)', marginBottom: '4px' }}>{skill.name}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>Practice & improve</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {userMode === 'teacher' ? (
          <>
            <StatCard title="Total Students" value={students.length} subtitle="In your groups" gradient={SKILLS[0].gradient} shadow={SKILLS[0].shadow} icon={GroupIcon} />
            <StatCard title="Active Groups" value={groups.length} subtitle="Managed by you" gradient={SKILLS[1].gradient} shadow={SKILLS[1].shadow} icon={SchoolIcon} />
            <StatCard title="Total Tasks" value={totalTasks} subtitle="Created this week" gradient={SKILLS[3].gradient} shadow={SKILLS[3].shadow} icon={AssignmentIcon} />
            <StatCard title="Today's Tasks" value={todayTasks.length} subtitle={todayName} gradient={SKILLS[2].gradient} shadow={SKILLS[2].shadow} icon={CalendarTodayIcon} />
          </>
        ) : (
          <>
            <StatCard title="Assigned Tasks" value={totalTasks} subtitle="Total tasks" gradient={SKILLS[3].gradient} shadow={SKILLS[3].shadow} icon={AssignmentIcon} />
            <StatCard title="Today's Tasks" value={todayTasks.length} subtitle={todayName} gradient={SKILLS[1].gradient} shadow={SKILLS[1].shadow} icon={CalendarTodayIcon} />
            <StatCard title="My Groups" value={groups.filter(g => g.studentIds?.includes(user?.id)).length} subtitle="Enrolled in" gradient={SKILLS[0].gradient} shadow={SKILLS[0].shadow} icon={GroupIcon} />
            <StatCard title="Progress" value="--" subtitle="Band Score" gradient={SKILLS[2].gradient} shadow={SKILLS[2].shadow} icon={TrendingUpIcon} />
          </>
        )}
      </div>

      {/* Two Column */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <SchedulePanel todayTasks={todayTasks} todayName={todayName} />
        <QuickActionsPanel userMode={userMode} />
      </div>
    </div>
  );
};

// Stat Card
const StatCard = ({ title, value, subtitle, gradient, shadow, icon: Icon }) => (
  <div style={{
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--glass-border)',
    borderRadius: '20px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    transition: 'all 0.25s ease',
    cursor: 'pointer'
  }}>
    <div style={{
      width: '60px',
      height: '60px',
      borderRadius: '16px',
      background: gradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 8px 24px ${shadow}`,
      flexShrink: 0
    }}>
      <Icon sx={{ fontSize: 28, color: 'white' }} />
    </div>
    <div>
      <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-default)', lineHeight: 1.1 }}>{value}</p>
      <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, color: 'var(--text-subtle)', marginTop: '4px' }}>{title}</p>
      {subtitle && <p style={{ fontSize: '12px', color: 'var(--text-disabled)', marginTop: '2px' }}>{subtitle}</p>}
    </div>
  </div>
);

// Schedule Panel
const SchedulePanel = ({ todayTasks, todayName }) => (
  <div style={{
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--glass-border)',
    borderRadius: '24px',
    padding: '28px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          background: 'var(--gradient-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 20px rgba(251, 146, 60, 0.35)'
        }}>
          <CalendarTodayIcon sx={{ fontSize: 22, color: 'white' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-default)' }}>Today's Schedule</h3>
          <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-subtle)' }}>{todayName}</p>
        </div>
      </div>
      <span style={{
        padding: '6px 14px',
        borderRadius: '100px',
        fontSize: '12px',
        fontWeight: 600,
        background: 'var(--speaking-bg)',
        color: 'var(--speaking)',
        border: '1px solid var(--speaking-border)'
      }}>
        {todayTasks.length} tasks
      </span>
    </div>

    {todayTasks.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 16px',
          borderRadius: '50%',
          background: 'var(--success-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CheckCircleIcon sx={{ fontSize: 32, color: 'var(--success)' }} />
        </div>
        <p style={{ fontWeight: 600, color: 'var(--text-default)', marginBottom: '4px' }}>All caught up!</p>
        <p style={{ fontSize: '14px', color: 'var(--text-subtle)' }}>No tasks scheduled for today</p>
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {todayTasks.slice(0, 4).map((task, i) => (
          <div key={task.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px',
            background: 'var(--surface-default)',
            border: '1px solid var(--border-default)',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '14px',
              flexShrink: 0
            }}>
              {i + 1}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontWeight: 500,
                color: 'var(--text-default)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>{task.title}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AccessTimeIcon sx={{ fontSize: 12 }} />
                  {task.deadline || 'No deadline'}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-500)' }}>{task.maxScore} pts</span>
              </div>
            </div>
            <ArrowForwardIcon sx={{ fontSize: 16, color: 'var(--text-subtle)' }} />
          </div>
        ))}
      </div>
    )}
  </div>
);

// Quick Actions Panel
const QuickActionsPanel = ({ userMode }) => {
  const actions = userMode === 'teacher' ? [
    { icon: GroupIcon, title: 'Manage Groups', desc: 'Create and organize study groups', gradient: SKILLS[0].gradient, shadow: SKILLS[0].shadow },
    { icon: AssignmentIcon, title: 'Create Task', desc: 'Add new assignments', gradient: SKILLS[3].gradient, shadow: SKILLS[3].shadow },
    { icon: TrendingUpIcon, title: 'View Statistics', desc: 'Analyze student performance', gradient: SKILLS[2].gradient, shadow: SKILLS[2].shadow }
  ] : [
    { icon: AssignmentIcon, title: 'View My Tasks', desc: 'Check your assigned work', gradient: SKILLS[3].gradient, shadow: SKILLS[3].shadow },
    { icon: TrendingUpIcon, title: 'My Progress', desc: 'Track your band score', gradient: SKILLS[2].gradient, shadow: SKILLS[2].shadow },
    { icon: CalendarTodayIcon, title: 'Weekly Schedule', desc: 'Plan your study time', gradient: SKILLS[1].gradient, shadow: SKILLS[1].shadow }
  ];

  return (
    <div style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--glass-border)',
      borderRadius: '24px',
      padding: '28px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          background: SKILLS[2].gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 8px 20px ${SKILLS[2].shadow}`
        }}>
          <TrendingUpIcon sx={{ fontSize: 22, color: 'white' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-default)' }}>Quick Actions</h3>
          <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-subtle)' }}>Get started</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <button key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              background: 'var(--surface-default)',
              border: '1px solid var(--border-default)',
              borderRadius: '16px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'all 0.2s ease'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: action.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 6px 16px ${action.shadow}`,
                flexShrink: 0
              }}>
                <Icon sx={{ fontSize: 22, color: 'white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 500, color: 'var(--text-default)', marginBottom: '2px' }}>{action.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>{action.desc}</p>
              </div>
              <ArrowForwardIcon sx={{ fontSize: 16, color: 'var(--primary-500)' }} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardHome;
