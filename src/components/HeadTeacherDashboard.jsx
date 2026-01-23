import React, { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// MUI Icons
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Head Teacher Theme Colors - Teal/Blue palette from image
const THEME = {
  primary: '#288FB2',      // Main teal/blue
  primaryDark: '#1C5570',  // Dark blue
  primaryLight: '#3BA7CC', // Light teal
  accent: '#F2D5A9',       // Cream/beige
  warning: '#FA3404',      // Red accent
  gradient: 'linear-gradient(135deg, #1C5570 0%, #288FB2 100%)',
  gradientAlt: 'linear-gradient(135deg, #288FB2 0%, #3BA7CC 100%)',
  shadow: 'rgba(40, 143, 178, 0.35)',
  bg: 'rgba(40, 143, 178, 0.08)',
  border: 'rgba(40, 143, 178, 0.2)'
};

// Skill Colors
const SKILL_COLORS = {
  listening: { color: '#288FB2', bg: 'rgba(40, 143, 178, 0.12)', gradient: 'linear-gradient(135deg, #288FB2, #1C5570)' },
  reading: { color: '#1C5570', bg: 'rgba(28, 85, 112, 0.12)', gradient: 'linear-gradient(135deg, #1C5570, #0F3A4D)' },
  writing: { color: '#34D399', bg: 'rgba(52, 211, 153, 0.12)', gradient: 'linear-gradient(135deg, #34D399, #059669)' },
  speaking: { color: '#FA3404', bg: 'rgba(250, 52, 4, 0.12)', gradient: 'linear-gradient(135deg, #FA3404, #CC2A03)' }
};

const CHART_COLORS = ['#288FB2', '#1C5570', '#34D399', '#FA3404', '#F2D5A9', '#3BA7CC'];

const HeadTeacherDashboard = ({ user, teachers = [], students = [], groups = [], tasks = {} }) => {
  const [activeView, setActiveView] = useState('overview');
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [chartType, setChartType] = useState('bar');

  const totalTasks = Object.values(tasks).flat().length;

  // Stable value generator
  const getStableValue = (id, min, max) => {
    const hash = String(id).split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
    return min + (Math.abs(hash) % (max - min + 1));
  };

  // Teacher statistics
  const teacherStats = useMemo(() => {
    return teachers.map(teacher => {
      const teacherGroups = groups.filter(g => g.teacherId === teacher.id);
      const teacherStudents = teacherGroups.reduce((acc, g) => acc + (g.studentIds?.length || 0), 0);
      const groupTasks = teacherGroups.reduce((acc) => acc + getStableValue(teacher.id + 100, 5, 25), 0);

      return {
        ...teacher,
        groupCount: teacherGroups.length,
        studentCount: teacherStudents,
        taskCount: groupTasks,
        rating: (3 + getStableValue(teacher.id, 0, 20) / 10).toFixed(1),
        completionRate: 70 + getStableValue(teacher.id + 50, 0, 30)
      };
    }).sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
  }, [teachers, groups]);

  // Group statistics
  const groupStats = useMemo(() => {
    return groups.map(group => {
      const teacher = teachers.find(t => t.id === group.teacherId);
      const studentCount = group.studentIds?.length || 0;

      return {
        ...group,
        teacherName: teacher?.name || 'Unassigned',
        studentCount,
        avgScore: 60 + getStableValue(group.id, 0, 30),
        completionRate: 60 + getStableValue(group.id + 10, 0, 40),
        listening: 5 + getStableValue(group.id + 20, 0, 25) / 10,
        reading: 5 + getStableValue(group.id + 30, 0, 25) / 10,
        writing: 4 + getStableValue(group.id + 40, 0, 30) / 10,
        speaking: 5 + getStableValue(group.id + 50, 0, 25) / 10
      };
    });
  }, [groups, teachers]);

  // Chart data
  const roleDistribution = [
    { name: 'Head Teachers', value: teachers.filter(t => t.role === 'headteacher').length, color: THEME.primary },
    { name: 'Teachers', value: teachers.filter(t => t.role === 'teacher').length, color: SKILL_COLORS.reading.color },
    { name: 'Students', value: students.length, color: SKILL_COLORS.writing.color }
  ];

  const groupComparisonData = groupStats.slice(0, 6).map(g => ({
    name: g.name.length > 8 ? g.name.slice(0, 8) + '..' : g.name,
    students: g.studentCount,
    avgScore: g.avgScore,
    completion: g.completionRate
  }));

  const weeklyData = [
    { day: 'Mon', tasks: 12, completed: 10 },
    { day: 'Tue', tasks: 15, completed: 13 },
    { day: 'Wed', tasks: 18, completed: 15 },
    { day: 'Thu', tasks: 14, completed: 12 },
    { day: 'Fri', tasks: 20, completed: 18 },
    { day: 'Sat', tasks: 8, completed: 7 },
    { day: 'Sun', tasks: 5, completed: 5 }
  ];

  const toggleGroupSelection = (groupId) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : prev.length < 4 ? [...prev, groupId] : prev
    );
  };

  const comparisonData = useMemo(() => {
    if (selectedGroups.length < 2) return null;
    const selected = groupStats.filter(g => selectedGroups.includes(g.id));
    return {
      skills: [
        { skill: 'Listening', ...Object.fromEntries(selected.map(g => [g.name, g.listening])) },
        { skill: 'Reading', ...Object.fromEntries(selected.map(g => [g.name, g.reading])) },
        { skill: 'Writing', ...Object.fromEntries(selected.map(g => [g.name, g.writing])) },
        { skill: 'Speaking', ...Object.fromEntries(selected.map(g => [g.name, g.speaking])) }
      ],
      groups: selected
    };
  }, [selectedGroups, groupStats]);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease', width: '100%' }}>
      {/* === HEADER === */}
      <header style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        padding: 'clamp(16px, 3vw, 28px)',
        marginBottom: 'clamp(16px, 3vw, 24px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Gradient Bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${THEME.primary}, ${SKILL_COLORS.reading.color}, ${SKILL_COLORS.writing.color}, ${SKILL_COLORS.speaking.color})`
        }} />

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'clamp(16px, 3vw, 24px)'
        }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 'clamp(64px, 10vw, 80px)',
              height: 'clamp(64px, 10vw, 80px)',
              borderRadius: '18px',
              background: THEME.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 12px 32px ${THEME.shadow}`
            }}>
              <SupervisorAccountIcon sx={{ fontSize: 'clamp(32px, 5vw, 40px)', color: 'white' }} />
            </div>
            <div style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#10B981',
              border: '3px solid var(--bg-base)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircleIcon sx={{ fontSize: 12, color: 'white' }} />
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: '180px' }}>
            <p style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontWeight: 700,
              color: THEME.primary,
              marginBottom: '6px'
            }}>
              Head Teacher Dashboard 👑
            </p>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(20px, 4vw, 28px)',
              fontWeight: 700,
              color: 'var(--text-default)',
              marginBottom: '6px',
              lineHeight: 1.2
            }}>
              Welcome, {user?.name || 'Head Teacher'}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Monitor teachers, groups & performance
            </p>
          </div>

          {/* Quick Stats */}
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <QuickStat value={teachers.length} label="Teachers" color={THEME.primary} />
            <QuickStat value={students.length} label="Students" color={SKILL_COLORS.writing.color} />
            <QuickStat value={groups.length} label="Groups" color={SKILL_COLORS.speaking.color} />
          </div>
        </div>
      </header>

      {/* === TABS === */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: 'clamp(20px, 3vw, 28px)',
        flexWrap: 'wrap',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {[
          { id: 'overview', icon: BarChartIcon, label: 'Overview' },
          { id: 'teachers', icon: SchoolIcon, label: 'Teachers' },
          { id: 'groups', icon: GroupIcon, label: 'Groups' },
          { id: 'compare', icon: CompareArrowsIcon, label: 'Compare' },
          { id: 'ranking', icon: LeaderboardIcon, label: 'Rankings' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: 'clamp(10px, 2vw, 14px) clamp(16px, 3vw, 24px)',
              borderRadius: '14px',
              border: activeView === tab.id ? `2px solid ${THEME.primary}` : '1px solid var(--border-default)',
              background: activeView === tab.id ? THEME.bg : 'var(--surface-default)',
              color: activeView === tab.id ? THEME.primary : 'var(--text-muted)',
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(12px, 2vw, 14px)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <tab.icon sx={{ fontSize: 18 }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* === OVERVIEW TAB === */}
      {activeView === 'overview' && (
        <>
          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 'clamp(12px, 2vw, 20px)',
            marginBottom: 'clamp(20px, 3vw, 32px)'
          }}>
            <StatCard icon={SchoolIcon} label="Teachers" value={teachers.length} color={SKILL_COLORS.reading.color} gradient={SKILL_COLORS.reading.gradient} />
            <StatCard icon={PersonIcon} label="Students" value={students.length} color={SKILL_COLORS.writing.color} gradient={SKILL_COLORS.writing.gradient} />
            <StatCard icon={GroupIcon} label="Groups" value={groups.length} color={SKILL_COLORS.speaking.color} gradient={SKILL_COLORS.speaking.gradient} />
            <StatCard icon={AssignmentIcon} label="Tasks" value={totalTasks} color={THEME.primaryLight} gradient={THEME.gradient} />
          </div>

          {/* Charts */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(16px, 3vw, 24px)',
            marginBottom: 'clamp(16px, 3vw, 24px)'
          }}>
            {/* Pie Chart */}
            <Panel title="User Distribution" icon={PieChartIcon} iconColor={THEME.primaryLight}>
              <div style={{ height: 'clamp(200px, 30vw, 280px)' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius="40%"
                      outerRadius="70%"
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--surface-default)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '10px',
                        fontSize: '13px'
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '12px' }}
                      formatter={(value) => <span style={{ color: 'var(--text-muted)' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            {/* Bar Chart */}
            <Panel title="Group Performance" icon={BarChartIcon} iconColor={SKILL_COLORS.reading.color}>
              <div style={{ height: 'clamp(200px, 30vw, 280px)' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={groupComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickMargin={8} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--surface-default)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '10px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="students" name="Students" fill={SKILL_COLORS.reading.color} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgScore" name="Avg Score" fill={SKILL_COLORS.writing.color} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>

          {/* Line Chart */}
          <Panel title="Weekly Task Completion" icon={ShowChartIcon} iconColor={SKILL_COLORS.writing.color}>
            <div style={{ height: 'clamp(200px, 30vw, 280px)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                  <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface-default)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '10px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="tasks" name="Total" stroke={SKILL_COLORS.reading.color} strokeWidth={2} dot={{ r: 4, fill: SKILL_COLORS.reading.color }} />
                  <Line type="monotone" dataKey="completed" name="Done" stroke="#10B981" strokeWidth={2} dot={{ r: 4, fill: '#10B981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </>
      )}

      {/* === TEACHERS TAB === */}
      {activeView === 'teachers' && (
        <Panel title={`All Teachers (${teachers.length})`} icon={SchoolIcon} iconColor={SKILL_COLORS.reading.color}>
          {teachers.length === 0 ? (
            <EmptyState icon={SchoolIcon} message="No teachers found" />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'clamp(12px, 2vw, 16px)'
            }}>
              {teacherStats.map(teacher => (
                <TeacherCard key={teacher.id} teacher={teacher} />
              ))}
            </div>
          )}
        </Panel>
      )}

      {/* === GROUPS TAB === */}
      {activeView === 'groups' && (
        <Panel title={`All Groups (${groups.length})`} icon={GroupIcon} iconColor={SKILL_COLORS.speaking.color}>
          {groups.length === 0 ? (
            <EmptyState icon={GroupIcon} message="No groups found" />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 'clamp(12px, 2vw, 16px)'
            }}>
              {groupStats.map(group => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          )}
        </Panel>
      )}

      {/* === COMPARE TAB === */}
      {activeView === 'compare' && (
        <Panel
          title="Compare Groups"
          icon={CompareArrowsIcon}
          iconColor={THEME.primary}
          headerRight={
            <div style={{ display: 'flex', gap: '8px' }}>
              <ChartTypeBtn active={chartType === 'bar'} onClick={() => setChartType('bar')} icon={BarChartIcon} label="Bar" />
              <ChartTypeBtn active={chartType === 'radar'} onClick={() => setChartType('radar')} icon={PieChartIcon} label="Radar" />
            </div>
          }
        >
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Select 2-4 groups to compare their IELTS performance
          </p>

          {/* Group Selection */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
            {groupStats.map(group => (
              <button
                key={group.id}
                onClick={() => toggleGroupSelection(group.id)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: selectedGroups.includes(group.id) ? `2px solid ${THEME.primary}` : '1px solid var(--border-default)',
                  background: selectedGroups.includes(group.id) ? THEME.bg : 'var(--surface-default)',
                  color: selectedGroups.includes(group.id) ? THEME.primary : 'var(--text-muted)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {group.name}
              </button>
            ))}
          </div>

          {/* Chart */}
          {comparisonData ? (
            <div style={{ height: 'clamp(280px, 40vw, 380px)' }}>
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={comparisonData.skills} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                    <XAxis dataKey="skill" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 9]} />
                    <Tooltip contentStyle={{ background: 'var(--surface-default)', border: '1px solid var(--border-default)', borderRadius: '10px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    {comparisonData.groups.map((group, i) => (
                      <Bar key={group.id} dataKey={group.name} fill={CHART_COLORS[i]} radius={[4, 4, 0, 0]} />
                    ))}
                  </BarChart>
                ) : (
                  <RadarChart data={comparisonData.skills}>
                    <PolarGrid stroke="var(--border-default)" />
                    <PolarAngleAxis dataKey="skill" stroke="var(--text-muted)" fontSize={12} />
                    <PolarRadiusAxis domain={[0, 9]} stroke="var(--text-muted)" fontSize={10} />
                    {comparisonData.groups.map((group, i) => (
                      <Radar key={group.id} name={group.name} dataKey={group.name} stroke={CHART_COLORS[i]} fill={CHART_COLORS[i]} fillOpacity={0.25} strokeWidth={2} />
                    ))}
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ background: 'var(--surface-default)', border: '1px solid var(--border-default)', borderRadius: '10px', fontSize: '12px' }} />
                  </RadarChart>
                )}
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon={CompareArrowsIcon} message="Select at least 2 groups to compare" />
          )}
        </Panel>
      )}

      {/* === RANKINGS TAB === */}
      {activeView === 'ranking' && (
        <Panel title="Teacher Rankings" icon={LeaderboardIcon} iconColor="#FBBF24">
          {teacherStats.length === 0 ? (
            <EmptyState icon={LeaderboardIcon} message="No teachers to rank" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {teacherStats.map((teacher, index) => (
                <RankingCard key={teacher.id} teacher={teacher} rank={index + 1} />
              ))}
            </div>
          )}
        </Panel>
      )}
    </div>
  );
};

// === COMPONENTS ===

const QuickStat = ({ value, label, color }) => (
  <div style={{
    textAlign: 'center',
    padding: 'clamp(10px, 2vw, 14px) clamp(14px, 3vw, 20px)',
    borderRadius: '14px',
    background: `${color}15`,
    border: `1px solid ${color}40`,
    minWidth: '70px'
  }}>
    <p style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, color }}>{value}</p>
    <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</p>
  </div>
);

const StatCard = ({ icon: Icon, label, value, color, gradient }) => (
  <div style={{
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: 'clamp(16px, 3vw, 24px)',
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(12px, 2vw, 16px)'
  }}>
    <div style={{
      width: 'clamp(44px, 8vw, 56px)',
      height: 'clamp(44px, 8vw, 56px)',
      borderRadius: '14px',
      background: gradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 6px 20px ${color}50`,
      flexShrink: 0
    }}>
      <Icon sx={{ fontSize: 'clamp(22px, 4vw, 28px)', color: 'white' }} />
    </div>
    <div>
      <p style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700, color: 'var(--text-default)', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-subtle)', fontWeight: 600, marginTop: '4px' }}>{label}</p>
    </div>
  </div>
);

const Panel = ({ title, icon: Icon, iconColor, children, headerRight }) => (
  <div style={{
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid var(--glass-border)',
    borderRadius: '20px',
    padding: 'clamp(20px, 4vw, 28px)',
    marginBottom: 'clamp(16px, 3vw, 24px)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'clamp(16px, 3vw, 24px)', flexWrap: 'wrap', gap: '12px' }}>
      <h3 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 600, color: 'var(--text-default)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
        {Icon && <Icon sx={{ fontSize: 22, color: iconColor }} />}
        {title}
      </h3>
      {headerRight}
    </div>
    {children}
  </div>
);

const ChartTypeBtn = ({ active, onClick, icon: Icon, label }) => (
  <button onClick={onClick} style={{
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '10px',
    border: active ? `1px solid ${THEME.primary}` : '1px solid var(--border-default)',
    background: active ? THEME.bg : 'var(--surface-default)',
    color: active ? THEME.primary : 'var(--text-muted)',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer'
  }}>
    <Icon sx={{ fontSize: 14 }} />
    {label}
  </button>
);

const EmptyState = ({ icon: Icon, message }) => (
  <div style={{ textAlign: 'center', padding: 'clamp(40px, 8vw, 60px) 20px' }}>
    <div style={{
      width: '64px',
      height: '64px',
      margin: '0 auto 16px',
      borderRadius: '50%',
      background: 'var(--surface-default)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Icon sx={{ fontSize: 28, color: 'var(--text-subtle)' }} />
    </div>
    <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>{message}</p>
  </div>
);

const TeacherCard = ({ teacher }) => (
  <div style={{
    background: 'var(--surface-default)',
    border: '1px solid var(--border-default)',
    borderRadius: '16px',
    padding: 'clamp(16px, 3vw, 20px)',
    transition: 'all 0.2s'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: teacher.role === 'headteacher' ? THEME.gradient : SKILL_COLORS.reading.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {teacher.role === 'headteacher'
          ? <SupervisorAccountIcon sx={{ fontSize: 22, color: 'white' }} />
          : <SchoolIcon sx={{ fontSize: 22, color: 'white' }} />
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-default)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{teacher.name}</p>
        <p style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{teacher.role === 'headteacher' ? 'Head Teacher' : 'Teacher'}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: '#FBBF2420', borderRadius: '100px' }}>
        <StarIcon sx={{ fontSize: 12, color: '#FBBF24' }} />
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#FBBF24' }}>{teacher.rating}</span>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
      <MiniStat value={teacher.groupCount} label="Groups" />
      <MiniStat value={teacher.studentCount} label="Students" />
      <MiniStat value={`${teacher.completionRate}%`} label="Done" />
    </div>
  </div>
);

const MiniStat = ({ value, label }) => (
  <div style={{ textAlign: 'center', padding: '10px 8px', background: 'var(--bg-muted)', borderRadius: '10px' }}>
    <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-default)' }}>{value}</p>
    <p style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)' }}>{label}</p>
  </div>
);

const GroupCard = ({ group }) => (
  <div style={{
    background: 'var(--surface-default)',
    border: '1px solid var(--border-default)',
    borderRadius: '16px',
    padding: 'clamp(16px, 3vw, 20px)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: SKILL_COLORS.speaking.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <GroupIcon sx={{ fontSize: 22, color: 'white' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-default)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group.name}</h4>
        <p style={{ fontSize: '11px', color: 'var(--text-subtle)', margin: 0 }}>{group.studentCount} students</p>
      </div>
    </div>

    {group.teacherName !== 'Unassigned' && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--bg-muted)', borderRadius: '10px', marginBottom: '12px' }}>
        <SchoolIcon sx={{ fontSize: 14, color: SKILL_COLORS.reading.color }} />
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-default)' }}>{group.teacherName}</strong>
        </span>
      </div>
    )}

    <div style={{ display: 'flex', gap: '8px' }}>
      <div style={{ flex: 1, textAlign: 'center', padding: '8px', background: `${SKILL_COLORS.reading.color}15`, borderRadius: '8px' }}>
        <p style={{ fontSize: '16px', fontWeight: 700, color: SKILL_COLORS.reading.color }}>{group.avgScore}</p>
        <p style={{ fontSize: '9px', color: 'var(--text-subtle)' }}>AVG</p>
      </div>
      <div style={{ flex: 1, textAlign: 'center', padding: '8px', background: '#10B98115', borderRadius: '8px' }}>
        <p style={{ fontSize: '16px', fontWeight: 700, color: '#10B981' }}>{group.completionRate}%</p>
        <p style={{ fontSize: '9px', color: 'var(--text-subtle)' }}>DONE</p>
      </div>
    </div>
  </div>
);

const RankingCard = ({ teacher, rank }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(12px, 2vw, 16px)',
    padding: 'clamp(14px, 3vw, 20px)',
    background: 'var(--surface-default)',
    border: rank <= 3 ? `2px solid ${rank === 1 ? '#FBBF24' : rank === 2 ? '#9CA3AF' : '#D97706'}` : '1px solid var(--border-default)',
    borderRadius: '14px',
    flexWrap: 'wrap'
  }}>
    {/* Rank Badge */}
    <div style={{
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: '14px',
      background: rank === 1 ? 'linear-gradient(135deg, #FBBF24, #F59E0B)' :
                  rank === 2 ? 'linear-gradient(135deg, #9CA3AF, #6B7280)' :
                  rank === 3 ? 'linear-gradient(135deg, #D97706, #B45309)' :
                  'var(--bg-muted)',
      color: rank <= 3 ? 'white' : 'var(--text-muted)',
      flexShrink: 0
    }}>
      {rank <= 3 ? <EmojiEventsIcon sx={{ fontSize: 18 }} /> : rank}
    </div>

    {/* Avatar */}
    <div style={{
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      background: teacher.role === 'headteacher' ? THEME.gradient : SKILL_COLORS.reading.gradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      {teacher.role === 'headteacher'
        ? <SupervisorAccountIcon sx={{ fontSize: 20, color: 'white' }} />
        : <SchoolIcon sx={{ fontSize: 20, color: 'white' }} />
      }
    </div>

    {/* Info */}
    <div style={{ flex: 1, minWidth: '120px' }}>
      <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-default)' }}>{teacher.name}</p>
      <p style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{teacher.groupCount} groups • {teacher.studentCount} students</p>
    </div>

    {/* Stats */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: '10px', color: 'var(--text-subtle)', marginBottom: '2px' }}>Complete</p>
        <p style={{ fontSize: '14px', fontWeight: 700, color: '#10B981' }}>{teacher.completionRate}%</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#FBBF2420', borderRadius: '100px' }}>
        <StarIcon sx={{ fontSize: 14, color: '#FBBF24' }} />
        <span style={{ fontSize: '14px', fontWeight: 700, color: '#FBBF24' }}>{teacher.rating}</span>
      </div>
    </div>
  </div>
);

export default HeadTeacherDashboard;
