import React, { useState } from 'react';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import LoginIcon from '@mui/icons-material/Login';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { authenticateUser, authenticateSuperAdmin, getUsers } from '../data';
import { useTheme } from '../context/ThemeContext';

const Login = ({ onLogin, onAdminLogin }) => {
    const { theme, toggleTheme } = useTheme();
    const [role, setRole] = useState('student');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showAdminAccess, setShowAdminAccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        await new Promise(resolve => setTimeout(resolve, 600));

        // Check for super admin access
        if (showAdminAccess) {
            const admin = authenticateSuperAdmin(username, password);
            if (admin) {
                onAdminLogin(admin);
            } else {
                setError('Invalid admin credentials.');
            }
            setIsLoading(false);
            return;
        }

        // Regular user login
        const user = authenticateUser(username, password, role);
        if (user) {
            onLogin(user);
        } else {
            // Check if any users exist for this role
            const users = getUsers().filter(u => u.role === role);
            if (users.length === 0) {
                setError(`No ${role}s registered yet. Contact administrator.`);
            } else {
                setError('Invalid username or password.');
            }
        }
        setIsLoading(false);
    };

    const getRoleIcon = () => {
        if (showAdminAccess) return <AdminPanelSettingsIcon sx={{ fontSize: 48, color: '#fff' }} />;
        switch (role) {
            case 'headteacher': return <SupervisorAccountIcon sx={{ fontSize: 48, color: '#fff' }} />;
            case 'teacher': return <SchoolIcon sx={{ fontSize: 48, color: '#fff' }} />;
            default: return <MenuBookIcon sx={{ fontSize: 48, color: '#fff' }} />;
        }
    };

    const getRoleGradient = () => {
        if (showAdminAccess) return 'from-red-500 to-pink-600';
        switch (role) {
            case 'headteacher': return 'from-purple-500 to-violet-600';
            case 'teacher': return 'from-blue-500 to-cyan-600';
            default: return 'from-emerald-500 to-teal-600';
        }
    };

    return (
        <div className="login-container">
            {/* Background Elements */}
            <div className="glass-orb orb-1"></div>
            <div className="glass-orb orb-2"></div>
            <div className="glass-orb orb-3"></div>

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="fixed top-6 right-6 p-3 rounded-xl bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white transition-all z-50"
            >
                {theme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </button>

            <div className="login-content">
                <div className="login-card glass-panel fade-in-up">
                    <div className="login-header">
                        <div className={`login-logo shake-on-hover bg-gradient-to-br ${getRoleGradient()}`}>
                            {getRoleIcon()}
                        </div>
                        <h1>{showAdminAccess ? 'Admin Access' : 'English Study Academy'}</h1>
                        <p>{showAdminAccess ? 'Super Administrator Login' : 'IELTS & English Learning Platform'}</p>
                    </div>

                    {!showAdminAccess && (
                        <div className="role-selector">
                            <button
                                type="button"
                                className={`role-btn ${role === 'headteacher' ? 'active' : ''}`}
                                onClick={() => { setRole('headteacher'); setError(''); }}
                            >
                                <SupervisorAccountIcon fontSize="small" /> Head Teacher
                            </button>
                            <button
                                type="button"
                                className={`role-btn ${role === 'teacher' ? 'active' : ''}`}
                                onClick={() => { setRole('teacher'); setError(''); }}
                            >
                                <SchoolIcon fontSize="small" /> Teacher
                            </button>
                            <button
                                type="button"
                                className={`role-btn ${role === 'student' ? 'active' : ''}`}
                                onClick={() => { setRole('student'); setError(''); }}
                            >
                                <MenuBookIcon fontSize="small" /> Student
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group slide-in">
                            <div className="input-icon">
                                <PersonIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                            </div>
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="glass-input"
                                autoFocus
                                required
                            />
                        </div>
                        <div className="input-group slide-in" style={{ animationDelay: '0.1s' }}>
                            <div className="input-icon">
                                <LockIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                            </div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="glass-input"
                                required
                            />
                        </div>

                        {error && <div className="login-error scale-in">{error}</div>}

                        <button
                            type="submit"
                            className={`glass-btn-primary ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="loader"></span>
                            ) : (
                                <>
                                    <LoginIcon sx={{ fontSize: 20 }} />
                                    <span>{showAdminAccess ? 'Access Admin Panel' : 'Sign In'}</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        {showAdminAccess ? (
                            <button
                                onClick={() => { setShowAdminAccess(false); setError(''); setUsername(''); setPassword(''); }}
                                className="text-zinc-500 hover:text-amber-400 text-sm underline"
                            >
                                ← Back to User Login
                            </button>
                        ) : (
                            <>
                                <p className="text-zinc-500 text-sm">
                                    Contact your administrator for login credentials
                                </p>
                                <button
                                    onClick={() => { setShowAdminAccess(true); setError(''); setUsername(''); setPassword(''); }}
                                    className="mt-4 text-zinc-600 hover:text-red-400 text-xs flex items-center gap-1 mx-auto transition-colors"
                                >
                                    <AdminPanelSettingsIcon sx={{ fontSize: 14 }} />
                                    Admin Access
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
