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
import { useTheme } from '../context/ThemeContext';

const AdminPanel = ({ onLogout }) => {
    const { theme, toggleTheme } = useTheme();
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [activeTab, setActiveTab] = useState('users');

    // User Form State
    const [showUserForm, setShowUserForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userForm, setUserForm] = useState({
        username: '',
        password: '',
        name: '',
        role: 'student'
    });

    // Group Form State
    const [showGroupForm, setShowGroupForm] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [groupForm, setGroupForm] = useState({
        name: '',
        teacherId: ''
    });

    useEffect(() => {
        loadData();
    }, []);

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
        setShowUserForm(false);
        setEditingUser(null);
        setUserForm({ username: '', password: '', name: '', role: 'student' });
        loadData();
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setUserForm({
            username: user.username,
            password: user.password,
            name: user.name,
            role: user.role
        });
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
        if (editingGroup) {
            updateGroup(editingGroup.id, {
                ...groupForm,
                teacherId: groupForm.teacherId ? Number(groupForm.teacherId) : null
            });
        } else {
            createGroup({
                ...groupForm,
                teacherId: groupForm.teacherId ? Number(groupForm.teacherId) : null,
                studentIds: []
            });
        }
        setShowGroupForm(false);
        setEditingGroup(null);
        setGroupForm({ name: '', teacherId: '' });
        loadData();
    };

    const handleEditGroup = (group) => {
        setEditingGroup(group);
        setGroupForm({
            name: group.name,
            teacherId: group.teacherId || ''
        });
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
            case 'headteacher': return <SupervisorAccountIcon sx={{ fontSize: 20 }} />;
            case 'teacher': return <SchoolIcon sx={{ fontSize: 20 }} />;
            default: return <PersonIcon sx={{ fontSize: 20 }} />;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'headteacher': return 'text-purple-400 bg-purple-500/20';
            case 'teacher': return 'text-blue-400 bg-blue-500/20';
            default: return 'text-emerald-400 bg-emerald-500/20';
        }
    };

    const teachers = users.filter(u => u.role === 'teacher' || u.role === 'headteacher');
    const headTeachers = users.filter(u => u.role === 'headteacher');
    const teachersList = users.filter(u => u.role === 'teacher');
    const students = users.filter(u => u.role === 'student');

    return (
        <div className="admin-panel min-h-screen p-6">
            {/* Header */}
            <header className="glass-panel p-6 mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                        <AdminPanelSettingsIcon sx={{ fontSize: 28, color: '#fff' }} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-white">Admin Panel</h1>
                        <p className="text-sm text-zinc-400">User & Group Management</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
                    >
                        {theme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                    </button>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20"
                    >
                        <LogoutIcon sx={{ fontSize: 18 }} />
                        Logout
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="glass-panel p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <SupervisorAccountIcon sx={{ fontSize: 24, color: '#a78bfa' }} />
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-white">{headTeachers.length}</p>
                        <p className="text-xs text-zinc-400 uppercase tracking-wider">Head Teachers</p>
                    </div>
                </div>
                <div className="glass-panel p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <SchoolIcon sx={{ fontSize: 24, color: '#60a5fa' }} />
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-white">{teachersList.length}</p>
                        <p className="text-xs text-zinc-400 uppercase tracking-wider">Teachers</p>
                    </div>
                </div>
                <div className="glass-panel p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <PersonIcon sx={{ fontSize: 24, color: '#34d399' }} />
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-white">{students.length}</p>
                        <p className="text-xs text-zinc-400 uppercase tracking-wider">Students</p>
                    </div>
                </div>
                <div className="glass-panel p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <GroupIcon sx={{ fontSize: 24, color: '#f59e0b' }} />
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-white">{groups.length}</p>
                        <p className="text-xs text-zinc-400 uppercase tracking-wider">Groups</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${activeTab === 'users'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    <PersonIcon sx={{ fontSize: 20 }} />
                    Users
                </button>
                <button
                    onClick={() => setActiveTab('groups')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${activeTab === 'groups'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    <GroupIcon sx={{ fontSize: 20 }} />
                    Groups
                </button>
            </div>

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white">User Management</h2>
                        <button
                            onClick={() => {
                                setEditingUser(null);
                                setUserForm({ username: '', password: '', name: '', role: 'student' });
                                setShowUserForm(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all"
                        >
                            <PersonAddIcon sx={{ fontSize: 20 }} />
                            Add User
                        </button>
                    </div>

                    {/* User Form Modal */}
                    {showUserForm && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="glass-panel p-8 w-full max-w-md m-4 border-amber-500/20 border-2">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold text-white">
                                        {editingUser ? 'Edit User' : 'Create New User'}
                                    </h3>
                                    <button
                                        onClick={() => setShowUserForm(false)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white"
                                    >
                                        <CloseIcon />
                                    </button>
                                </div>
                                <form onSubmit={handleUserSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={userForm.name}
                                            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                                            className="glass-input w-full"
                                            placeholder="Enter full name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">Username</label>
                                        <input
                                            type="text"
                                            value={userForm.username}
                                            onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                                            className="glass-input w-full"
                                            placeholder="Enter username"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">Password</label>
                                        <input
                                            type="text"
                                            value={userForm.password}
                                            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                            className="glass-input w-full"
                                            placeholder="Enter password"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">Role</label>
                                        <select
                                            value={userForm.role}
                                            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                                            className="glass-input w-full bg-slate-800"
                                        >
                                            <option value="student">Student</option>
                                            <option value="teacher">Teacher</option>
                                            <option value="headteacher">Head Teacher</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowUserForm(false)}
                                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                                        >
                                            <SaveIcon sx={{ fontSize: 18 }} />
                                            {editingUser ? 'Update' : 'Create'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Users List */}
                    <div className="space-y-4">
                        {/* Head Teachers */}
                        {headTeachers.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <SupervisorAccountIcon sx={{ fontSize: 16 }} />
                                    Head Teachers ({headTeachers.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {headTeachers.map(user => (
                                        <UserCard key={user.id} user={user} onEdit={handleEditUser} onDelete={handleDeleteUser} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Teachers */}
                        {teachersList.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <SchoolIcon sx={{ fontSize: 16 }} />
                                    Teachers ({teachersList.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {teachersList.map(user => (
                                        <UserCard key={user.id} user={user} onEdit={handleEditUser} onDelete={handleDeleteUser} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Students */}
                        {students.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <PersonIcon sx={{ fontSize: 16 }} />
                                    Students ({students.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {students.map(user => (
                                        <UserCard key={user.id} user={user} onEdit={handleEditUser} onDelete={handleDeleteUser} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {users.length === 0 && (
                            <div className="text-center py-16 text-zinc-500">
                                <PersonIcon sx={{ fontSize: 48, opacity: 0.5, mb: 2 }} />
                                <p>No users created yet. Click "Add User" to create your first user.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Groups Tab */}
            {activeTab === 'groups' && (
                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white">Group Management</h2>
                        <button
                            onClick={() => {
                                setEditingGroup(null);
                                setGroupForm({ name: '', teacherId: '' });
                                setShowGroupForm(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all"
                        >
                            <GroupAddIcon sx={{ fontSize: 20 }} />
                            Add Group
                        </button>
                    </div>

                    {/* Group Form Modal */}
                    {showGroupForm && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="glass-panel p-8 w-full max-w-md m-4 border-amber-500/20 border-2">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold text-white">
                                        {editingGroup ? 'Edit Group' : 'Create New Group'}
                                    </h3>
                                    <button
                                        onClick={() => setShowGroupForm(false)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white"
                                    >
                                        <CloseIcon />
                                    </button>
                                </div>
                                <form onSubmit={handleGroupSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">Group Name</label>
                                        <input
                                            type="text"
                                            value={groupForm.name}
                                            onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                                            className="glass-input w-full"
                                            placeholder="e.g., IELTS Morning Class"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">Assign Teacher</label>
                                        <select
                                            value={groupForm.teacherId}
                                            onChange={(e) => setGroupForm({ ...groupForm, teacherId: e.target.value })}
                                            className="glass-input w-full bg-slate-800"
                                        >
                                            <option value="">-- No Teacher --</option>
                                            {teachers.map(t => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name} ({t.role === 'headteacher' ? 'Head Teacher' : 'Teacher'})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowGroupForm(false)}
                                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                                        >
                                            <SaveIcon sx={{ fontSize: 18 }} />
                                            {editingGroup ? 'Update' : 'Create'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Groups List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups.map(group => {
                            const teacher = users.find(u => u.id === group.teacherId);
                            const groupStudents = students.filter(s => group.studentIds.includes(s.id));

                            return (
                                <div key={group.id} className="glass-panel p-6 border border-white/10 hover:border-amber-500/30 transition-colors">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                                <GroupIcon sx={{ fontSize: 24, color: '#fff' }} />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white">{group.name}</h4>
                                                <p className="text-xs text-zinc-400">
                                                    {teacher ? teacher.name : 'No teacher assigned'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleEditGroup(group)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-amber-400"
                                            >
                                                <EditIcon sx={{ fontSize: 18 }} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteGroup(group.id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-400"
                                            >
                                                <DeleteIcon sx={{ fontSize: 18 }} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-zinc-400">Students:</span>
                                        <span className="text-white font-medium">{groupStudents.length}</span>
                                    </div>
                                </div>
                            );
                        })}

                        {groups.length === 0 && (
                            <div className="col-span-full text-center py-16 text-zinc-500">
                                <GroupIcon sx={{ fontSize: 48, opacity: 0.5, mb: 2 }} />
                                <p>No groups created yet. Click "Add Group" to create your first group.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// User Card Component
const UserCard = ({ user, onEdit, onDelete }) => {
    const getRoleColor = (role) => {
        switch (role) {
            case 'headteacher': return 'from-purple-500 to-violet-600';
            case 'teacher': return 'from-blue-500 to-cyan-600';
            default: return 'from-emerald-500 to-teal-600';
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'headteacher': return { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Head Teacher' };
            case 'teacher': return { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Teacher' };
            default: return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Student' };
        }
    };

    const badge = getRoleBadge(user.role);

    return (
        <div className="glass-panel p-4 border border-white/5 hover:border-white/20 transition-all group">
            <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">{user.name}</h4>
                    <p className="text-xs text-zinc-500">@{user.username}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(user)}
                        className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-amber-400"
                    >
                        <EditIcon sx={{ fontSize: 16 }} />
                    </button>
                    <button
                        onClick={() => onDelete(user.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-400"
                    >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                    </button>
                </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${badge.bg} ${badge.text}`}>
                    {badge.label}
                </span>
                <span className="text-xs text-zinc-500">ID: {user.id}</span>
            </div>
        </div>
    );
};

export default AdminPanel;
