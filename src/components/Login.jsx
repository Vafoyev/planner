import React, { useState } from 'react';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import LoginIcon from '@mui/icons-material/Login';
import SchoolIcon from '@mui/icons-material/School'; // Teacher Icon
import MenuBookIcon from '@mui/icons-material/MenuBook'; // Student Icon
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const Login = ({ onLogin }) => {
    const [role, setRole] = useState('teacher'); // 'teacher' | 'student'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [studentName, setStudentName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate network delay for "Premium" feel
        await new Promise(resolve => setTimeout(resolve, 800));

        if (role === 'teacher') {
            if (username === 'admin' && password === '12345') {
                onLogin({ role: 'teacher', name: 'Administrator', id: 1 });
            } else {
                setError('Invalid Administrator Credentials');
                setIsLoading(false);
            }
        } else {
            // Student Login
            if (studentName.trim().length > 2) {
                onLogin({ role: 'student', name: studentName.trim(), id: Date.now() });
            } else {
                setError('Please enter your full name');
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="login-container">
            {/* Background Elements */}
            <div className="glass-orb orb-1"></div>
            <div className="glass-orb orb-2"></div>
            <div className="glass-orb orb-3"></div>

            <div className="login-content">
                <div className="login-card glass-panel fade-in-up">
                    <div className="login-header">
                        <div className="login-logo shake-on-hover">
                            <EmojiEventsIcon sx={{ fontSize: 40, color: '#fff' }} />
                        </div>
                        <h1>Exclusive Academy</h1>
                        <p>IELTS Planner System</p>
                    </div>

                    {/* Role Toggles */}
                    <div className="role-selector">
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

                    <form onSubmit={handleSubmit} className="login-form">
                        {role === 'teacher' ? (
                            <>
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
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="input-group slide-in">
                                <div className="input-icon">
                                    <PersonIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter your Student Name"
                                    value={studentName}
                                    onChange={(e) => setStudentName(e.target.value)}
                                    className="glass-input"
                                    autoFocus
                                />
                            </div>
                        )}

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
                                    <span>{role === 'teacher' ? 'Access Dashboard' : 'View Schedule'}</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>{role === 'teacher' ? 'Secured Administrative Access' : 'Student Portal Entry'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
