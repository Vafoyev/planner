import React, { useState } from 'react';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import LoginIcon from '@mui/icons-material/Login';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import WarningIcon from '@mui/icons-material/Warning';
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

    const user = authenticateUser(username, password, role);
    if (user) {
      onLogin(user);
    } else {
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
    if (showAdminAccess) return <AdminPanelSettingsIcon sx={{ fontSize: 40 }} />;
    switch (role) {
      case 'headteacher': return <SupervisorAccountIcon sx={{ fontSize: 40 }} />;
      case 'teacher': return <SchoolIcon sx={{ fontSize: 40 }} />;
      default: return <MenuBookIcon sx={{ fontSize: 40 }} />;
    }
  };

  const getLogoGradient = () => {
    if (showAdminAccess) return 'linear-gradient(135deg, #EF4444, #DC2626)';
    switch (role) {
      case 'headteacher': return 'linear-gradient(135deg, #A78BFA, #7C3AED)';
      case 'teacher': return 'linear-gradient(135deg, #60A5FA, #2563EB)';
      default: return 'linear-gradient(135deg, #34D399, #059669)';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--page-gradient)',
      backgroundAttachment: 'fixed',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Orbs */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'var(--primary-500)',
        filter: 'blur(150px)',
        opacity: 0.15,
        top: '-20%',
        left: '-10%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'var(--secondary-500)',
        filter: 'blur(150px)',
        opacity: 0.12,
        bottom: '-15%',
        right: '-10%',
        pointerEvents: 'none'
      }} />

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--surface-default)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 200ms ease',
          zIndex: 50
        }}
      >
        {theme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </button>

      {/* Login Card */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(24px)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-3xl)',
          padding: '48px 40px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.2)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              width: '88px',
              height: '88px',
              margin: '0 auto 24px',
              borderRadius: 'var(--radius-2xl)',
              background: getLogoGradient(),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 16px 40px rgba(59, 130, 246, 0.3)'
            }}>
              {getRoleIcon()}
            </div>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--text-3xl)',
              fontWeight: 700,
              color: 'var(--text-default)',
              marginBottom: '8px',
              letterSpacing: '-0.02em'
            }}>
              {showAdminAccess ? 'Admin Access' : 'English Academy'}
            </h1>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-muted)',
              letterSpacing: '0.02em'
            }}>
              {showAdminAccess ? 'Super Administrator Login' : 'IELTS & English Learning Platform'}
            </p>
          </div>

          {/* Role Selector */}
          {!showAdminAccess && (
            <div style={{
              display: 'flex',
              gap: '8px',
              padding: '6px',
              background: 'var(--surface-default)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-default)',
              marginBottom: '32px'
            }}>
              {[
                { id: 'headteacher', label: 'Head', icon: <SupervisorAccountIcon sx={{ fontSize: 16 }} /> },
                { id: 'teacher', label: 'Teacher', icon: <SchoolIcon sx={{ fontSize: 16 }} /> },
                { id: 'student', label: 'Student', icon: <MenuBookIcon sx={{ fontSize: 16 }} /> }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => { setRole(r.id); setError(''); }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '12px 8px',
                    borderRadius: 'var(--radius-lg)',
                    border: 'none',
                    background: role === r.id ? 'var(--primary-500)' : 'transparent',
                    color: role === r.id ? 'white' : 'var(--text-muted)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 200ms ease'
                  }}
                >
                  {r.icon}
                  {r.label}
                </button>
              ))}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {/* Username */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-subtle)',
                  display: 'flex'
                }}>
                  <PersonIcon sx={{ fontSize: 20 }} />
                </div>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 52px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-default)',
                    background: 'var(--surface-default)',
                    color: 'var(--text-default)',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 500,
                    outline: 'none',
                    transition: 'all 200ms ease'
                  }}
                />
              </div>

              {/* Password */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-subtle)',
                  display: 'flex'
                }}>
                  <LockIcon sx={{ fontSize: 20 }} />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 52px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-default)',
                    background: 'var(--surface-default)',
                    color: 'var(--text-default)',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 500,
                    outline: 'none',
                    transition: 'all 200ms ease'
                  }}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 16px',
                background: 'var(--error-bg)',
                border: '1px solid var(--error)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '20px'
              }}>
                <WarningIcon sx={{ fontSize: 18, color: 'var(--error)' }} />
                <span style={{ color: 'var(--error)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '18px 24px',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                background: 'var(--gradient-primary)',
                color: 'white',
                fontSize: 'var(--text-base)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
                transition: 'all 200ms ease'
              }}
            >
              {isLoading ? (
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
              ) : (
                <>
                  <LoginIcon sx={{ fontSize: 20 }} />
                  {showAdminAccess ? 'Access Admin Panel' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            {showAdminAccess ? (
              <button
                onClick={() => { setShowAdminAccess(false); setError(''); setUsername(''); setPassword(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                ← Back to User Login
              </button>
            ) : (
              <>
                <p style={{ color: 'var(--text-subtle)', fontSize: 'var(--text-xs)', marginBottom: '16px' }}>
                  Contact your administrator for login credentials
                </p>
                <button
                  onClick={() => { setShowAdminAccess(true); setError(''); setUsername(''); setPassword(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-disabled)',
                    fontSize: 'var(--text-xs)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
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
