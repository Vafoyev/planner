import React, { useState, useEffect } from 'react';
import {
    getUsers,
    getGroups,
    createUser,
    deleteUser,
    updateUser,
    createGroup,
    deleteGroup,
    updateGroup,
    getUsersByRole
} from '../data';

// MUI Icons
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import LogoutIcon from '@mui/icons-material/Logout';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTheme } from '../context/ThemeContext';

// Styles
const styles = {
    container: {
        minHeight: '100vh',
        padding: '32px',
        background: 'var(--page-gradient)',
        backgroundAttachment: 'fixed'
    },
    header: {
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '24px',
        padding: '28px 32px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
    },
    headerIcon: {
        width: '64px',
        height: '64px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #EF4444, #DC2626)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 12px 32px rgba(239, 68, 68, 0.4)'
    },
    headerTitle: {
        fontFamily: 'var(--font-serif)',
        fontSize: '28px',
        fontWeight: 700,
        color: 'var(--text-default)',
        marginBottom: '4px',
        letterSpacing: '-0.02em'
    },
    headerSubtitle: {
        fontSize: '14px',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
    },
    statCard: {
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        cursor: 'pointer',
        transition: 'all 0.25s ease'
    },
    statIcon: {
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    tabContainer: {
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap'
    },
    tab: (active) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '14px 28px',
        borderRadius: '16px',
        border: active ? '1px solid var(--primary-500)' : '1px solid var(--border-default)',
        background: active ? 'rgba(59, 130, 246, 0.15)' : 'var(--surface-default)',
        color: active ? 'var(--primary-400)' : 'var(--text-muted)',
        fontFamily: 'var(--font-sans)',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    }),
    panel: {
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '24px'
    },
    panelHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
    },
    panelTitle: {
        fontSize: '22px',
        fontWeight: 600,
        color: 'var(--text-default)'
    },
    btn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 24px',
        borderRadius: '14px',
        border: 'none',
        fontFamily: 'var(--font-sans)',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    btnPrimary: {
        background: 'var(--gradient-primary)',
        color: 'white',
        boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35)'
    },
    btnSecondary: {
        background: 'var(--gradient-secondary)',
        color: 'white',
        boxShadow: '0 8px 24px rgba(251, 146, 60, 0.35)'
    },
    btnDanger: {
        background: 'var(--error-bg)',
        color: 'var(--error)',
        border: '1px solid var(--error)'
    },
    btnGhost: {
        background: 'var(--surface-default)',
        color: 'var(--text-muted)',
        border: '1px solid var(--border-default)'
    },
    sectionTitle: {
        fontSize: '13px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--text-subtle)',
        marginBottom: '16px',
        marginTop: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    userCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '20px',
        background: 'var(--surface-default)',
        border: '1px solid var(--border-default)',
        borderRadius: '16px',
        marginBottom: '12px',
        transition: 'all 0.2s ease'
    },
    userAvatar: {
        width: '48px',
        height: '48px',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    badge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 12px',
        borderRadius: '100px',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    modal: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '24px'
    },
    modalContent: {
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px)',
        border: '2px solid var(--primary-500)',
        borderRadius: '24px',
        padding: '36px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.3)'
    },
    input: {
        width: '100%',
        padding: '16px 18px',
        borderRadius: '14px',
        border: '1px solid var(--border-default)',
        background: 'var(--surface-default)',
        color: 'var(--text-default)',
        fontSize: '14px',
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        outline: 'none',
        transition: 'all 0.2s ease'
    },
    label: {
        display: 'block',
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--text-muted)',
        marginBottom: '10px'
    },
    emptyState: {
        textAlign: 'center',
        padding: '64px 24px'
    }
};

// Role colors
const roleColors = {
    headteacher: { bg: 'rgba(167, 139, 250, 0.15)', color: '#A78BFA', gradient: 'linear-gradient(135deg, #A78BFA, #7C3AED)', shadow: 'rgba(167, 139, 250, 0.4)' },
    teacher: { bg: 'rgba(96, 165, 250, 0.15)', color: '#60A5FA', gradient: 'linear-gradient(135deg, #60A5FA, #2563EB)', shadow: 'rgba(96, 165, 250, 0.4)' },
    student: { bg: 'rgba(52, 211, 153, 0.15)', color: '#34D399', gradient: 'linear-gradient(135deg, #34D399, #059669)', shadow: 'rgba(52, 211, 153, 0.4)' }
};

const AdminPanel = ({ onLogout }) => {
    const { theme, toggleTheme } = useTheme();
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [activeTab, setActiveTab] = useState('users');

    // Form States
    const [showUserForm, setShowUserForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userForm, setUserForm] = useState({ username: '', password: '', name: '', role: 'student' });

    const [showGroupForm, setShowGroupForm] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [groupForm, setGroupForm] = useState({ name: '', teacherId: '' });

    useEffect(() => { loadData(); }, []);

    const loadData = () => {
        setUsers(getUsers().filter(u => u.role !== 'superadmin'));
        setGroups(getGroups());
    };

    // User CRUD
    const handleUserSubmit = (e) => {
        e.preventDefault();
        if (editingUser) {
            updateUser(editingUser.id, userForm);
        } else {
            createUser(userForm);
        }
        closeUserForm();
        loadData();
    };

    const closeUserForm = () => {
        setShowUserForm(false);
        setEditingUser(null);
        setUserForm({ username: '', password: '', name: '', role: 'student' });
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setUserForm({ username: user.username, password: user.password, name: user.name, role: user.role });
        setShowUserForm(true);
    };

    const handleDeleteUser = (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            deleteUser(userId);
            loadData();
        }
    };

    // Group CRUD
    const handleGroupSubmit = (e) => {
        e.preventDefault();
        const data = { ...groupForm, teacherId: groupForm.teacherId ? Number(groupForm.teacherId) : null };
        if (editingGroup) {
            updateGroup(editingGroup.id, data);
        } else {
            createGroup({ ...data, studentIds: [] });
        }
        closeGroupForm();
        loadData();
    };

    const closeGroupForm = () => {
        setShowGroupForm(false);
        setEditingGroup(null);
        setGroupForm({ name: '', teacherId: '' });
    };

    const handleEditGroup = (group) => {
        setEditingGroup(group);
        setGroupForm({ name: group.name, teacherId: group.teacherId || '' });
        setShowGroupForm(true);
    };

    const handleDeleteGroup = (groupId) => {
        if (window.confirm('Are you sure you want to delete this group?')) {
            deleteGroup(groupId);
            loadData();
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'headteacher': return <SupervisorAccountIcon sx={{ fontSize: 22 }} />;
            case 'teacher': return <SchoolIcon sx={{ fontSize: 22 }} />;
            default: return <PersonIcon sx={{ fontSize: 22 }} />;
        }
    };

    const teachers = users.filter(u => u.role === 'teacher' || u.role === 'headteacher');
    const headTeachers = users.filter(u => u.role === 'headteacher');
    const teachersList = users.filter(u => u.role === 'teacher');
    const students = users.filter(u => u.role === 'student');

    const stats = [
        { label: 'Head Teachers', value: headTeachers.length, icon: SupervisorAccountIcon, ...roleColors.headteacher },
        { label: 'Teachers', value: teachersList.length, icon: SchoolIcon, ...roleColors.teacher },
        { label: 'Students', value: students.length, icon: PersonIcon, ...roleColors.student },
        { label: 'Groups', value: groups.length, icon: GroupIcon, bg: 'rgba(251, 146, 60, 0.15)', color: '#FB923C', gradient: 'linear-gradient(135deg, #FB923C, #EA580C)', shadow: 'rgba(251, 146, 60, 0.4)' }
    ];

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <div style={styles.headerIcon}>
                        <AdminPanelSettingsIcon sx={{ fontSize: 32, color: 'white' }} />
                    </div>
                    <div>
                        <h1 style={styles.headerTitle}>Admin Panel</h1>
                        <p style={styles.headerSubtitle}>
                            <SettingsIcon sx={{ fontSize: 16 }} />
                            User & Group Management
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={toggleTheme}
                        style={{ ...styles.btn, ...styles.btnGhost, padding: '14px' }}
                    >
                        {theme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                    </button>
                    <button
                        onClick={onLogout}
                        style={{ ...styles.btn, ...styles.btnDanger }}
                    >
                        <LogoutIcon sx={{ fontSize: 18 }} />
                        Logout
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div style={styles.statsGrid}>
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} style={styles.statCard}>
                            <div style={{ ...styles.statIcon, background: stat.gradient, boxShadow: `0 8px 24px ${stat.shadow}` }}>
                                <Icon sx={{ fontSize: 28, color: 'white' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-default)', lineHeight: 1.1 }}>{stat.value}</p>
                                <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-subtle)', fontWeight: 600, marginTop: '4px' }}>{stat.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tabs */}
            <div style={styles.tabContainer}>
                <button style={styles.tab(activeTab === 'users')} onClick={() => setActiveTab('users')}>
                    <PersonIcon sx={{ fontSize: 20 }} />
                    Users
                </button>
                <button style={styles.tab(activeTab === 'groups')} onClick={() => setActiveTab('groups')}>
                    <GroupIcon sx={{ fontSize: 20 }} />
                    Groups
                </button>
            </div>

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div style={styles.panel}>
                    <div style={styles.panelHeader}>
                        <h2 style={styles.panelTitle}>User Management</h2>
                        <button
                            onClick={() => { setEditingUser(null); setUserForm({ username: '', password: '', name: '', role: 'student' }); setShowUserForm(true); }}
                            style={{ ...styles.btn, ...styles.btnPrimary }}
                        >
                            <PersonAddIcon sx={{ fontSize: 20 }} />
                            Add User
                        </button>
                    </div>

                    {users.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={{ width: '80px', height: '80px', margin: '0 auto 20px', borderRadius: '50%', background: 'var(--surface-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <PersonIcon sx={{ fontSize: 40, color: 'var(--text-subtle)' }} />
                            </div>
                            <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-default)', marginBottom: '8px' }}>No users yet</p>
                            <p style={{ fontSize: '14px', color: 'var(--text-subtle)' }}>Click "Add User" to create your first user.</p>
                        </div>
                    ) : (
                        <>
                            {/* Head Teachers */}
                            {headTeachers.length > 0 && (
                                <>
                                    <div style={styles.sectionTitle}>
                                        <SupervisorAccountIcon sx={{ fontSize: 18, color: roleColors.headteacher.color }} />
                                        Head Teachers ({headTeachers.length})
                                    </div>
                                    {headTeachers.map(user => <UserCard key={user.id} user={user} onEdit={handleEditUser} onDelete={handleDeleteUser} />)}
                                </>
                            )}

                            {/* Teachers */}
                            {teachersList.length > 0 && (
                                <>
                                    <div style={styles.sectionTitle}>
                                        <SchoolIcon sx={{ fontSize: 18, color: roleColors.teacher.color }} />
                                        Teachers ({teachersList.length})
                                    </div>
                                    {teachersList.map(user => <UserCard key={user.id} user={user} onEdit={handleEditUser} onDelete={handleDeleteUser} />)}
                                </>
                            )}

                            {/* Students */}
                            {students.length > 0 && (
                                <>
                                    <div style={styles.sectionTitle}>
                                        <PersonIcon sx={{ fontSize: 18, color: roleColors.student.color }} />
                                        Students ({students.length})
                                    </div>
                                    {students.map(user => <UserCard key={user.id} user={user} onEdit={handleEditUser} onDelete={handleDeleteUser} />)}
                                </>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Groups Tab */}
            {activeTab === 'groups' && (
                <div style={styles.panel}>
                    <div style={styles.panelHeader}>
                        <h2 style={styles.panelTitle}>Group Management</h2>
                        <button
                            onClick={() => { setEditingGroup(null); setGroupForm({ name: '', teacherId: '' }); setShowGroupForm(true); }}
                            style={{ ...styles.btn, ...styles.btnSecondary }}
                        >
                            <GroupAddIcon sx={{ fontSize: 20 }} />
                            Add Group
                        </button>
                    </div>

                    {groups.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={{ width: '80px', height: '80px', margin: '0 auto 20px', borderRadius: '50%', background: 'var(--surface-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <GroupIcon sx={{ fontSize: 40, color: 'var(--text-subtle)' }} />
                            </div>
                            <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-default)', marginBottom: '8px' }}>No groups created yet</p>
                            <p style={{ fontSize: '14px', color: 'var(--text-subtle)' }}>Click "Add Group" to create your first group.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                            {groups.map(group => (
                                <GroupCard key={group.id} group={group} users={users} onEdit={handleEditGroup} onDelete={handleDeleteGroup} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* User Form Modal */}
            {showUserForm && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                            <h3 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-default)' }}>
                                {editingUser ? 'Edit User' : 'Create New User'}
                            </h3>
                            <button onClick={closeUserForm} style={{ ...styles.btn, ...styles.btnGhost, padding: '10px' }}>
                                <CloseIcon sx={{ fontSize: 20 }} />
                            </button>
                        </div>
                        <form onSubmit={handleUserSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={styles.label}>Full Name</label>
                                    <input type="text" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} style={styles.input} placeholder="Enter full name" required />
                                </div>
                                <div>
                                    <label style={styles.label}>Username</label>
                                    <input type="text" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} style={styles.input} placeholder="Enter username" required />
                                </div>
                                <div>
                                    <label style={styles.label}>Password</label>
                                    <input type="text" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} style={styles.input} placeholder="Enter password" required />
                                </div>
                                <div>
                                    <label style={styles.label}>Role</label>
                                    <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} style={styles.input}>
                                        <option value="student">Student</option>
                                        <option value="teacher">Teacher</option>
                                        <option value="headteacher">Head Teacher</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                                <button type="button" onClick={closeUserForm} style={{ ...styles.btn, ...styles.btnGhost, flex: 1, justifyContent: 'center' }}>
                                    Cancel
                                </button>
                                <button type="submit" style={{ ...styles.btn, ...styles.btnPrimary, flex: 1, justifyContent: 'center' }}>
                                    <SaveIcon sx={{ fontSize: 18 }} />
                                    {editingUser ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Group Form Modal */}
            {showGroupForm && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                            <h3 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-default)' }}>
                                {editingGroup ? 'Edit Group' : 'Create New Group'}
                            </h3>
                            <button onClick={closeGroupForm} style={{ ...styles.btn, ...styles.btnGhost, padding: '10px' }}>
                                <CloseIcon sx={{ fontSize: 20 }} />
                            </button>
                        </div>
                        <form onSubmit={handleGroupSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={styles.label}>Group Name</label>
                                    <input type="text" value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} style={styles.input} placeholder="e.g., Batch 1" required />
                                </div>
                                <div>
                                    <label style={styles.label}>Assign Teacher (Optional)</label>
                                    <select value={groupForm.teacherId} onChange={(e) => setGroupForm({ ...groupForm, teacherId: e.target.value })} style={styles.input}>
                                        <option value="">-- Select Teacher --</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>{t.name} ({t.role === 'headteacher' ? 'Head' : 'Teacher'})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                                <button type="button" onClick={closeGroupForm} style={{ ...styles.btn, ...styles.btnGhost, flex: 1, justifyContent: 'center' }}>
                                    Cancel
                                </button>
                                <button type="submit" style={{ ...styles.btn, ...styles.btnSecondary, flex: 1, justifyContent: 'center' }}>
                                    <SaveIcon sx={{ fontSize: 18 }} />
                                    {editingGroup ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// User Card Component
const UserCard = ({ user, onEdit, onDelete }) => {
    const role = roleColors[user.role] || roleColors.student;
    const Icon = user.role === 'headteacher' ? SupervisorAccountIcon : user.role === 'teacher' ? SchoolIcon : PersonIcon;

    return (
        <div style={styles.userCard}>
            <div style={{ ...styles.userAvatar, background: role.gradient, boxShadow: `0 6px 16px ${role.shadow}` }}>
                <Icon sx={{ fontSize: 22, color: 'white' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-default)', marginBottom: '4px' }}>{user.name}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-subtle)', marginBottom: '8px' }}>@{user.username}</p>
                <span style={{ ...styles.badge, background: role.bg, color: role.color }}>
                    {user.role === 'headteacher' ? 'Head Teacher' : user.role === 'teacher' ? 'Teacher' : 'Student'}
                </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => onEdit(user)} style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--border-default)', background: 'var(--surface-default)', cursor: 'pointer', color: 'var(--primary-400)', transition: 'all 0.2s' }}>
                    <EditIcon sx={{ fontSize: 18 }} />
                </button>
                <button onClick={() => onDelete(user.id)} style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--error)', background: 'var(--error-bg)', cursor: 'pointer', color: 'var(--error)', transition: 'all 0.2s' }}>
                    <DeleteIcon sx={{ fontSize: 18 }} />
                </button>
            </div>
        </div>
    );
};

// Group Card Component
const GroupCard = ({ group, users, onEdit, onDelete }) => {
    const teacher = users.find(u => u.id === group.teacherId);
    const studentCount = group.studentIds?.length || 0;

    return (
        <div style={{
            background: 'var(--surface-default)',
            border: '1px solid var(--border-default)',
            borderRadius: '20px',
            padding: '24px',
            transition: 'all 0.2s ease'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #FB923C, #EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(251, 146, 60, 0.35)' }}>
                        <GroupIcon sx={{ fontSize: 24, color: 'white' }} />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-default)' }}>{group.name}</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>{studentCount} student{studentCount !== 1 ? 's' : ''}</p>
                    </div>
                </div>
            </div>

            {teacher && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: 'var(--bg-muted)', borderRadius: '12px', marginBottom: '16px' }}>
                    <SchoolIcon sx={{ fontSize: 18, color: roleColors.teacher.color }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Teacher: <strong style={{ color: 'var(--text-default)' }}>{teacher.name}</strong></span>
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => onEdit(group)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-default)', background: 'var(--surface-default)', cursor: 'pointer', color: 'var(--primary-400)', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s' }}>
                    <EditIcon sx={{ fontSize: 16 }} />
                    Edit
                </button>
                <button onClick={() => onDelete(group.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', borderRadius: '12px', border: '1px solid var(--error)', background: 'var(--error-bg)', cursor: 'pointer', color: 'var(--error)', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s' }}>
                    <DeleteIcon sx={{ fontSize: 16 }} />
                    Delete
                </button>
            </div>
        </div>
    );
};

export default AdminPanel;
