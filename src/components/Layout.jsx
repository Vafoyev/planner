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
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden'
    }}>
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4"
          style={{
            height: '64px',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border-default)'
          }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'var(--gradient-primary)' }}>
              <EmojiEventsIcon sx={{ fontSize: 20 }} />
            </div>
            <div>
              <span className="font-serif font-bold text-lg block" style={{ color: 'var(--text-default)' }}>English Academy</span>
              <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>Learning Platform</span>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{ background: 'var(--surface-default)', border: '1px solid var(--border-default)', color: 'var(--text-default)' }}
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

      {/* Sidebar - Fixed position */}
      {!isMobile && (
        <aside style={{
          width: '260px',
          minWidth: '260px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
          flexShrink: 0,
          background: 'var(--bg-base)',
          borderRight: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Decorative Top Gradient */}
          <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.08) 0%, transparent 100%)' }} />

          {/* Logo (Desktop) */}
          <div className="p-5 relative z-10 hidden lg:block" style={{ borderBottom: '1px solid var(--border-default)' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ background: 'var(--gradient-primary)', boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)' }}>
                <EmojiEventsIcon sx={{ fontSize: 24 }} />
              </div>
              <div>
                <h1 className="text-base font-serif font-bold leading-tight" style={{ color: 'var(--text-default)' }}>
                  English Study<br /><span style={{ color: 'var(--primary-400)' }}>Academy</span>
                </h1>
              </div>
            </div>
            <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: 'var(--text-subtle)' }}>Learning Platform</p>
          </div>

          {/* Mobile Menu Header */}
          <div className="lg:hidden p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-default)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Menu</span>
            <button onClick={() => setIsSidebarOpen(false)} style={{ color: 'var(--text-subtle)' }}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`.nav-scroll::-webkit-scrollbar { display: none; }`}</style>
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest mb-2 mt-1" style={{ color: 'var(--text-subtle)' }}>Main Menu</p>

            <button
              className={`nav-item w-full ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavClick('dashboard')}
            >
              <DashboardIcon sx={{ fontSize: 20 }} />
              <span>Dashboard</span>
            </button>

            {userMode === 'teacher' && (
              <button
                className={`nav-item w-full ${currentView === 'groups' ? 'active' : ''}`}
                onClick={() => handleNavClick('groups')}
              >
                <FolderIcon sx={{ fontSize: 20 }} />
                <span>Groups</span>
                <span className="nav-badge">{userGroups.length}</span>
              </button>
            )}

            <button
              className={`nav-item w-full ${currentView === 'schedule' ? 'active' : ''}`}
              onClick={() => handleNavClick('schedule')}
            >
              <CalendarTodayIcon sx={{ fontSize: 20 }} />
              <span>Tasks</span>
            </button>

            {userMode === 'teacher' && (
              <button
                className={`nav-item w-full ${currentView === 'students' ? 'active' : ''}`}
                onClick={() => handleNavClick('students')}
              >
                <GroupIcon sx={{ fontSize: 20 }} />
                <span>Students</span>
                <span className="nav-badge">{students.length}</span>
              </button>
            )}

            <button
              className={`nav-item w-full ${currentView === 'statistics' ? 'active' : ''}`}
              onClick={() => handleNavClick('statistics')}
            >
              <TrendingUpIcon sx={{ fontSize: 20 }} />
              <span>Statistics</span>
            </button>

            {/* Filter Selectors */}
            {(userMode === 'teacher' && (userGroups.length > 0 || students.length > 0)) && (
              <div className="my-4 pt-4 space-y-4" style={{ borderTop: '1px solid var(--border-default)' }}>
                {userGroups.length > 0 && (
                  <div className="px-2">
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-subtle)' }}>
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
                      className="w-full glass-input text-xs py-2 h-10"
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
          <div style={{
            padding: '16px',
            borderTop: '1px solid var(--border-default)',
            background: 'var(--surface-default)',
            marginTop: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  flexShrink: 0
                }}>
                  {getRoleIcon()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-default)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</p>
                  <p className={getRoleColor()} style={{ fontSize: '12px' }}>{getRoleName()}</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {theme === 'dark' ? <LightModeIcon sx={{ fontSize: 18 }} /> : <DarkModeIcon sx={{ fontSize: 18 }} />}
              </button>
            </div>
            <button
              className="btn btn-danger"
              onClick={onLogout}
              style={{ width: '100%', padding: '10px', fontSize: '14px' }}
            >
              <LogoutIcon sx={{ fontSize: 16 }} />
              Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* Mobile Sidebar */}
      {isMobile && isSidebarOpen && (
        <aside style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '280px',
          height: '100vh',
          background: 'var(--bg-base)',
          borderRight: '1px solid var(--border-default)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideIn 0.2s ease'
        }}>
          {/* Mobile menu header */}
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Menu</span>
            <button onClick={() => setIsSidebarOpen(false)} style={{ color: 'var(--text-subtle)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </button>
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
            <button className={`nav-item w-full ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => handleNavClick('dashboard')}>
              <DashboardIcon sx={{ fontSize: 20 }} /> <span>Dashboard</span>
            </button>
            {userMode === 'teacher' && (
              <button className={`nav-item w-full ${currentView === 'groups' ? 'active' : ''}`} onClick={() => handleNavClick('groups')}>
                <FolderIcon sx={{ fontSize: 20 }} /> <span>Groups</span>
              </button>
            )}
            <button className={`nav-item w-full ${currentView === 'schedule' ? 'active' : ''}`} onClick={() => handleNavClick('schedule')}>
              <CalendarTodayIcon sx={{ fontSize: 20 }} /> <span>Tasks</span>
            </button>
            {userMode === 'teacher' && (
              <button className={`nav-item w-full ${currentView === 'students' ? 'active' : ''}`} onClick={() => handleNavClick('students')}>
                <GroupIcon sx={{ fontSize: 20 }} /> <span>Students</span>
              </button>
            )}
            <button className={`nav-item w-full ${currentView === 'statistics' ? 'active' : ''}`} onClick={() => handleNavClick('statistics')}>
              <TrendingUpIcon sx={{ fontSize: 20 }} /> <span>Statistics</span>
            </button>
          </nav>
        </aside>
      )}

      {/* Main Content */}
      <main style={{
        flex: 1,
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingTop: isMobile ? '64px' : 0
      }}>
        <div style={{
          padding: isMobile ? '16px' : '24px',
          width: '100%'
        }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
