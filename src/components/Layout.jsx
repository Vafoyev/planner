import React, { useState, useEffect } from 'react';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import FolderIcon from '@mui/icons-material/Folder';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '../context/ThemeContext';

const Layout = ({
  currentView,
  setCurrentView,
  user,
  userMode,
  groups = [],
  selectedGroup,
  setSelectedGroup,
  students = [],
  selectedStudent,
  setSelectedStudent,
  onLogout,
  children
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = (view) => {
    setCurrentView(view);
    if (isMobile) setIsSidebarOpen(false);
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'headteacher': return <SupervisorAccountIcon sx={{ fontSize: 20 }} />;
      case 'teacher': return <SchoolIcon sx={{ fontSize: 20 }} />;
      default: return <PersonIcon sx={{ fontSize: 20 }} />;
    }
  };

  const getRoleName = () => {
    switch (user?.role) {
      case 'headteacher': return 'Head Teacher';
      case 'teacher': return 'Teacher';
      default: return 'Student';
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'headteacher': return 'text-purple-400';
      case 'teacher': return 'text-blue-400';
      default: return 'text-emerald-400';
    }
  };

  // Get user's groups
  const userGroups = user?.role === 'student'
    ? groups.filter(g => g.studentIds?.includes(user.id))
    : user?.role === 'teacher'
      ? groups.filter(g => g.teacherId === user.id)
      : groups;

  return (
    <div className="app-container flex min-h-screen relative">
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 h-16 bg-slate-900/90 backdrop-blur-md border-b border-white/5 z-40 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white">
              <EmojiEventsIcon sx={{ fontSize: 16 }} />
            </div>
            <span className="font-serif font-bold text-white text-lg">English Academy</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: 'var(--glass-hover)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)'
            }}
          >
            {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      )}

      {/* Sidebar Overlay (Mobile) */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Premium Sidebar */}
      <div className={`
        sidebar w-72 p-4 md:p-6 fixed lg:relative z-50 h-[100dvh] lg:h-screen transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="glass-panel h-full flex flex-col relative overflow-hidden shadow-2xl lg:shadow-none">
          {/* Decorative Top Glow */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />

          {/* Logo (Desktop) */}
          <div className="logo-section p-4 md:p-6 border-b relative z-10 hidden lg:block" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 text-white">
                <EmojiEventsIcon sx={{ fontSize: 28 }} />
              </div>
              <h1 className="text-xl font-serif font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>English Study<br /><span className="text-amber-400">Academy</span></h1>
            </div>
            <p className="text-xs uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>IELTS Learning Platform</p>
          </div>

          {/* Mobile Menu Header */}
          <div className="lg:hidden p-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-zinc-400 text-sm font-medium">Menu</span>
            <button onClick={() => setIsSidebarOpen(false)} className="text-zinc-400">
              <CloseIcon sx={{ fontSize: 20 }} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="nav-menu flex-1 p-2 md:p-4 space-y-1.5 md:space-y-2 overflow-y-auto custom-scrollbar">
            <p className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 mt-4">Main Menu</p>

            <button
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${currentView === 'dashboard' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-900/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
              onClick={() => handleNavClick('dashboard')}
            >
              <DashboardIcon sx={{ fontSize: 20 }} className={currentView === 'dashboard' ? 'text-amber-400' : 'text-zinc-500 group-hover:text-white'} />
              <span className="font-medium">Dashboard</span>
            </button>

            {userMode === 'teacher' && (
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${currentView === 'groups' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-900/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                onClick={() => handleNavClick('groups')}
              >
                <FolderIcon sx={{ fontSize: 20 }} className={currentView === 'groups' ? 'text-amber-400' : 'text-zinc-500 group-hover:text-white'} />
                <span className="font-medium">Groups</span>
                <span className="ml-auto bg-white/10 text-xs px-2 py-0.5 rounded-full">{userGroups.length}</span>
              </button>
            )}

            <button
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${currentView === 'schedule' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-900/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
              onClick={() => handleNavClick('schedule')}
            >
              <CalendarTodayIcon sx={{ fontSize: 20 }} className={currentView === 'schedule' ? 'text-amber-400' : 'text-zinc-500 group-hover:text-white'} />
              <span className="font-medium">Tasks</span>
            </button>

            {userMode === 'teacher' && (
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${currentView === 'students' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-900/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                onClick={() => handleNavClick('students')}
              >
                <GroupIcon sx={{ fontSize: 20 }} className={currentView === 'students' ? 'text-amber-400' : 'text-zinc-500 group-hover:text-white'} />
                <span className="font-medium">Students</span>
                <span className="ml-auto bg-white/10 text-xs px-2 py-0.5 rounded-full">{students.length}</span>
              </button>
            )}

            <button
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${currentView === 'statistics' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-900/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
              onClick={() => handleNavClick('statistics')}
            >
              <TrendingUpIcon sx={{ fontSize: 20 }} className={currentView === 'statistics' ? 'text-amber-400' : 'text-zinc-500 group-hover:text-white'} />
              <span className="font-medium">Statistics</span>
            </button>

            {/* Filter Selectors */}
            {(userMode === 'teacher' && (userGroups.length > 0 || students.length > 0)) && (
              <div className="my-4 pt-4 border-t border-white/5 space-y-4">
                {userGroups.length > 0 && (
                  <div className="px-2">
                    <p className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                      <FolderIcon sx={{ fontSize: 12 }} />
                      Active Group
                    </p>
                    <select
                      value={selectedGroup?.id || ''}
                      onChange={(e) => {
                        const group = groups.find(g => g.id === Number(e.target.value));
                        setSelectedGroup(group || null);
                        if (isMobile) setIsSidebarOpen(false);
                      }}
                      className="w-full glass-input bg-slate-800 border-slate-700 text-xs py-2 h-10"
                    >
                      <option value="">-- All Groups --</option>
                      {userGroups.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {students.length > 0 && (currentView === 'schedule' || currentView === 'statistics') && (
                  <div className="px-2">
                    <p className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                      <PersonIcon sx={{ fontSize: 12 }} />
                      Student
                    </p>
                    <select
                      value={selectedStudent?.id || ''}
                      onChange={(e) => {
                        const student = students.find(s => s.id === Number(e.target.value));
                        setSelectedStudent(student || null);
                        if (isMobile) setIsSidebarOpen(false);
                      }}
                      className="w-full glass-input bg-slate-800 border-slate-700 text-xs py-2 h-10"
                    >
                      <option value="">-- All Students --</option>
                      {students.map(student => (
                        <option key={student.id} value={student.id}>{student.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t" style={{ borderColor: 'var(--glass-border)', backgroundColor: 'var(--glass-hover)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ring-2"
                  style={{ backgroundColor: 'var(--glass-bg)', color: 'var(--text-primary)', ringColor: 'var(--glass-border)' }}>
                  {getRoleIcon()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name || 'User'}</p>
                  <p className={`text-xs ${getRoleColor()} truncate`}>{getRoleName()}</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg transition-colors flex-shrink-0"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--glass-hover)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                {theme === 'dark' ? <LightModeIcon sx={{ fontSize: 18 }} /> : <DarkModeIcon sx={{ fontSize: 18 }} />}
              </button>
            </div>
            <button
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors text-sm font-medium border border-red-500/20"
              onClick={onLogout}
            >
              <LogoutIcon sx={{ fontSize: 16 }} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <main className="main-content flex-1 pt-20 lg:pt-0 pl-0 relative w-full overflow-x-hidden min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
