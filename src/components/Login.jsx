import React, { useState } from 'react';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EmailIcon from '@mui/icons-material/Email';

const Login = ({ onLogin }) => {
    const [role, setRole] = useState('teacher');
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [studentName, setStudentName] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [studentPassword, setStudentPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        await new Promise(resolve => setTimeout(resolve, 800));

        // Unified User Database
        const users = JSON.parse(localStorage.getItem('ielts_users') || '[]');

        if (role === 'teacher') {
            if (isRegister) {
                if (username.trim().length >= 3 && password.length >= 5 && email.includes('@')) {
                    const existing = users.find(u => u.username === username || u.email === email);
                    if (existing) {
                        setError('User with this username or email already exists.');
                        setIsLoading(false);
                        return;
                    }

                    const newTeacher = {
                        id: Date.now(),
                        role: 'teacher',
                        username: username.trim(),
                        email: email.trim(),
                        name: username.trim(), // Use username as display name for now
                        password: password
                    };
                    users.push(newTeacher);
                    localStorage.setItem('ielts_users', JSON.stringify(users));
                    onLogin(newTeacher);
                } else {
                    setError('Please fill all fields correctly (username: 3+ chars, password: 5+ chars, valid email)');
                    setIsLoading(false);
                }
            } else {
                const teacher = users.find(u =>
                    u.role === 'teacher' &&
                    (u.username === username || u.email === username) &&
                    u.password === password
                );

                if (teacher) {
                    onLogin(teacher);
                } else if (username === 'admin' && password === '12345') {
                    onLogin({ role: 'teacher', name: 'Administrator', id: 1 });
                } else {
                    setError('Invalid credentials.');
                    setIsLoading(false);
                }
            }
        } else {
            // Student Logic
            if (isRegister) {
                if (studentName.trim().length >= 2 && studentEmail.includes('@') && studentPassword.length >= 4) {
                    const existing = users.find(u => u.username === studentName || u.email === studentEmail);
                    if (existing) {
                        setError('Student with this name or email already exists.');
                        setIsLoading(false);
                        return;
                    }

                    const newStudent = {
                        id: Date.now(),
                        role: 'student',
                        name: studentName.trim(), // Display name
                        username: studentName.trim(), // Treat name as username key for simplicity
                        email: studentEmail.trim(),
                        password: studentPassword
                    };
                    users.push(newStudent);
                    localStorage.setItem('ielts_users', JSON.stringify(users));
                    onLogin(newStudent);
                } else {
                    setError('Please enter valid details and a password (min 4 chars).');
                    setIsLoading(false);
                }
            } else {
                const student = users.find(u =>
                    u.role === 'student' &&
                    (u.username === studentName.trim() || u.email === studentName.trim()) &&
                    u.password === studentPassword
                );

                if (student) {
                    onLogin(student);
                } else {
                    setError('Invalid credentials.');
                    setIsLoading(false);
                }
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
                            <EmojiEventsIcon sx={{ fontSize: 48, color: '#fff' }} />
                        </div>
                        <h1>English Study Academy</h1>
                        <p>IELTS & English Learning Platform</p>
                    </div>

                    {/* Role Toggles */}
                    <div className="role-selector">
                        <button
                            type="button"
                            className={`role-btn ${role === 'teacher' ? 'active' : ''}`}
                            onClick={() => { setRole('teacher'); setError(''); setIsRegister(false); }}
                        >
                            <SchoolIcon fontSize="small" /> Teacher
                        </button>
                        <button
                            type="button"
                            className={`role-btn ${role === 'student' ? 'active' : ''}`}
                            onClick={() => { setRole('student'); setError(''); setIsRegister(false); }}
                        >
                            <MenuBookIcon fontSize="small" /> Student
                        </button>
                    </div>

                    {/* Login/Register Toggle */}
                    <div className="auth-mode-selector">
                        <button
                            type="button"
                            className={`auth-mode-btn ${!isRegister ? 'active' : ''}`}
                            onClick={() => { setIsRegister(false); setError(''); }}
                        >
                            <LoginIcon fontSize="small" /> Sign In
                        </button>
                        <button
                            type="button"
                            className={`auth-mode-btn ${isRegister ? 'active' : ''}`}
                            onClick={() => { setIsRegister(true); setError(''); }}
                        >
                            <PersonAddIcon fontSize="small" /> Register
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
                                        placeholder={isRegister ? "Choose a username" : "Username or Email"}
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="glass-input"
                                        autoFocus
                                        required
                                    />
                                </div>
                                {isRegister && (
                                    <div className="input-group slide-in" style={{ animationDelay: '0.05s' }}>
                                        <div className="input-icon">
                                            <EmailIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="Email address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="glass-input"
                                            required
                                        />
                                    </div>
                                )}
                                <div className="input-group slide-in" style={{ animationDelay: isRegister ? '0.1s' : '0.1s' }}>
                                    <div className="input-icon">
                                        <LockIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder={isRegister ? "Create password (min. 5 characters)" : "Password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="glass-input"
                                        required
                                        minLength={isRegister ? 5 : 1}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="input-group slide-in">
                                    <div className="input-icon">
                                        <PersonIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={isRegister ? "Your full name" : "Name or Email"}
                                        value={studentName}
                                        onChange={(e) => setStudentName(e.target.value)}
                                        className="glass-input"
                                        autoFocus
                                        required
                                    />
                                </div>
                                {isRegister && (
                                    <div className="input-group slide-in" style={{ animationDelay: '0.1s' }}>
                                        <div className="input-icon">
                                            <EmailIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="Email address"
                                            value={studentEmail}
                                            onChange={(e) => setStudentEmail(e.target.value)}
                                            className="glass-input"
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                                )}
                        <div className="input-group slide-in" style={{ animationDelay: '0.1s' }}>
                            <div className="input-icon">
                                <LockIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                            </div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={studentPassword}
                                onChange={(e) => setStudentPassword(e.target.value)}
                                className="glass-input"
                                required
                                minLength={4}
                            />
                        </div>
                    </>
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
                                {isRegister ? (
                                    <PersonAddIcon sx={{ fontSize: 20 }} />
                                ) : (
                                    <LoginIcon sx={{ fontSize: 20 }} />
                                )}
                                <span>
                                    {isRegister
                                        ? (role === 'teacher' ? 'Create Account' : 'Join as Student')
                                        : (role === 'teacher' ? 'Sign In to Dashboard' : 'View My Schedule')
                                    }
                                </span>
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>
                        {isRegister
                            ? (role === 'teacher' ? 'Create your teaching account' : 'Start your learning journey')
                            : (role === 'teacher' ? 'Secured Administrative Access' : 'Student Portal Entry')
                        }
                    </p>
                </div>
            </div>
        </div>
        </div >
    );
};

export default Login;
