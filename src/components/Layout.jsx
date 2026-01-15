import React from 'react';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const Layout = ({
  currentView,
  setCurrentView,
  user,
  userMode,
  students = [],
  selectedStudent,
  setSelectedStudent,
  onLogout,
  children
}) => {
  return (
    <div className="app-container flex min-h-screen">
      {/* Premium Sidebar */}
      <div className="sidebar w-72 p-6 flex-shrink-0 relative z-10">
        <div className="glass-panel h-full flex flex-col relative overflow-hidden bg-slate-900/80 backdrop-blur-2xl border border-white/5 shadow-2xl">
          {/* Decorative Top Glow */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />

          {/* Logo */}
          <div className="logo-section p-6 border-b border-white/5 relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
                <EmojiEventsIcon sx={{ fontSize: 24 }} />
              </div>
              <h1 className="text-xl font-serif font-bold text-white tracking-tight">Exclusive<br /><span className="text-amber-400">Academy</span></h1>
            </div>
            <p className="text-xs text-zinc-400 uppercase tracking-widest pl-1">Premium IELTS Planner</p>
          </div>

          {/* Navigation */}
          <nav className="nav-menu flex-1 p-4 space-y-2 overflow-y-auto">
            <p className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 mt-4">Main Menu</p>

            <button
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${currentView === 'schedule' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-900/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
              onClick={() => setCurrentView('schedule')}
            >
              <CalendarTodayIcon sx={{ fontSize: 20 }} className={currentView === 'schedule' ? 'text-amber-400' : 'text-zinc-500 group-hover:text-white'} />
              <span className="font-medium">Weekly Schedule</span>
            </button>

            {userMode === 'teacher' && (
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${currentView === 'students' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-900/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                onClick={() => setCurrentView('students')}
              >
                <GroupIcon sx={{ fontSize: 20 }} className={currentView === 'students' ? 'text-amber-400' : 'text-zinc-500 group-hover:text-white'} />
                <span className="font-medium">Students</span>
                <span className="ml-auto bg-white/10 text-xs px-2 py-0.5 rounded-full">{students.length}</span>
              </button>
            )}

            <button
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${currentView === 'dashboard' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-900/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
              onClick={() => setCurrentView('dashboard')}
            >
              <DashboardIcon sx={{ fontSize: 20 }} className={currentView === 'dashboard' ? 'text-amber-400' : 'text-zinc-500 group-hover:text-white'} />
              <span className="font-medium">Analytics</span>
            </button>

            {/* Student Selector for Teacher */}
            {userMode === 'teacher' && students.length > 0 && currentView === 'schedule' && (
              <div className="mt-8 p-4 rounded-xl bg-black/20 border border-white/5">
                <p className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                  <PersonIcon sx={{ fontSize: 14 }} />
                  Grading Mode
                </p>
                <select
                  value={selectedStudent?.id || ''}
                  onChange={(e) => {
                    const student = students.find(s => s.id === Number(e.target.value));
                    setSelectedStudent(student || null);
                  }}
                  className="w-full glass-input bg-slate-800 border-slate-700 text-sm py-2"
                >
                  <option value="">-- No Student --</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-white/5 bg-black/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white ring-2 ring-white/10">
                {userMode === 'teacher' ? <SchoolIcon sx={{ fontSize: 20 }} /> : <PersonIcon sx={{ fontSize: 20 }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-amber-500">{userMode === 'teacher' ? 'Teacher' : 'Student'}</p>
              </div>
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

      <main className="main-content flex-1 p-6 pl-0 relative overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
