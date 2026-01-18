import React, { useState, useEffect } from 'react';
import {
    getGroups,
    getUsers,
    createGroup,
    deleteGroup,
    updateGroup,
    addStudentToGroup,
    removeStudentFromGroup
} from '../data';

import GroupIcon from '@mui/icons-material/Group';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WarningIcon from '@mui/icons-material/Warning';

const GroupManager = ({ user, onSelectGroup, selectedGroup }) => {
    const [groups, setGroups] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [expandedGroup, setExpandedGroup] = useState(null);

    // Form states
    const [showGroupForm, setShowGroupForm] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [groupForm, setGroupForm] = useState({ name: '', teacherId: '' });
    const [showAddStudent, setShowAddStudent] = useState(null);
    const [formError, setFormError] = useState('');

    const isHeadTeacher = user?.role === 'headteacher';
    const isTeacher = user?.role === 'teacher';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const allGroups = getGroups();
        const users = getUsers();

        // Filter groups based on role
        // Teachers only see groups where they are assigned
        let filteredGroups = allGroups;
        if (isTeacher) {
            filteredGroups = allGroups.filter(g => g.teacherId === user.id);
        }

        setGroups(filteredGroups);
        setAllUsers(users);
    };

    const students = allUsers.filter(u => u.role === 'student');
    // Only regular teachers for assignment (not head teachers)
    const teachers = allUsers.filter(u => u.role === 'teacher');

    // Group CRUD (Head Teacher only)
    const handleGroupSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        // Validate teacher selection
        if (!groupForm.teacherId) {
            setFormError('Please select a teacher for this group');
            return;
        }

        if (editingGroup) {
            updateGroup(editingGroup.id, {
                name: groupForm.name,
                teacherId: Number(groupForm.teacherId)
            });
        } else {
            createGroup({
                name: groupForm.name,
                teacherId: Number(groupForm.teacherId),
                studentIds: []
            });
        }
        setShowGroupForm(false);
        setEditingGroup(null);
        setGroupForm({ name: '', teacherId: '' });
        loadData();
    };


    const handleDeleteGroup = (groupId) => {
        if (window.confirm('Are you sure you want to delete this group?')) {
            deleteGroup(groupId);
            loadData();
            if (selectedGroup?.id === groupId) {
                onSelectGroup(null);
            }
        }
    };

    // Student management
    const handleAddStudent = (groupId, studentId) => {
        addStudentToGroup(groupId, studentId);
        loadData();
        setShowAddStudent(null);
    };

    const handleRemoveStudent = (groupId, studentId) => {
        if (window.confirm('Remove this student from the group?')) {
            removeStudentFromGroup(groupId, studentId);
            loadData();
        }
    };

    const getAvailableStudents = (group) => {
        return students.filter(s => !group.studentIds.includes(s.id));
    };

    return (
        <div className="group-manager">
            {/* Header */}
            <header className="page-glass-header mb-8">
                <div className="header-icon-glass">
                    <GroupIcon sx={{ fontSize: 28, color: '#f59e0b' }} />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-serif text-white">Group Management</h2>
                    <p className="text-sm text-zinc-400 font-sans mt-1">
                        {isHeadTeacher ? 'Create and manage study groups' : 'Manage your assigned groups'}
                    </p>
                </div>

                {isHeadTeacher && (
                    <button
                        onClick={() => {
                            setEditingGroup(null);
                            setGroupForm({ name: '', teacherId: '' });
                            setFormError('');
                            setShowGroupForm(true);
                        }}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all"
                    >
                        <GroupAddIcon sx={{ fontSize: 20 }} />
                        Create Group
                    </button>
                )}
            </header>

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

                        {/* Error Message */}
                        {formError && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                                <WarningIcon sx={{ fontSize: 18 }} />
                                {formError}
                            </div>
                        )}

                        {/* Warning if no teachers available */}
                        {teachers.length === 0 && (
                            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2 text-amber-400 text-sm">
                                <WarningIcon sx={{ fontSize: 18 }} />
                                No teachers available. Please create a teacher account first.
                            </div>
                        )}

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

                            {/* Teacher Selection - Required */}
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">
                                    Assign Teacher <span className="text-red-400">*</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <SchoolIcon sx={{ fontSize: 20, color: '#3b82f6' }} />
                                    <select
                                        value={groupForm.teacherId}
                                        onChange={(e) => setGroupForm({ ...groupForm, teacherId: e.target.value })}
                                        className="glass-input flex-1 bg-slate-800"
                                        required
                                    >
                                        <option value="">-- Select a Teacher --</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>
                                                {t.name} (@{t.username})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">
                                    Only the assigned teacher can see and manage this group
                                </p>
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
                                    disabled={teachers.length === 0}
                                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <SaveIcon sx={{ fontSize: 18 }} />
                                    {editingGroup ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* Groups Grid */}
            <div className="space-y-4">
                {groups.length === 0 ? (
                    <div className="glass-panel p-16 text-center border-2 border-dashed border-white/5">
                        <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-6">
                            <GroupIcon sx={{ fontSize: 48, color: '#475569' }} />
                        </div>
                        <h3 className="text-xl font-serif text-white mb-2">No Groups Yet</h3>
                        <p className="text-zinc-500 text-sm max-w-md mx-auto">
                            {isHeadTeacher
                                ? 'Create your first group to start organizing students'
                                : 'No groups have been assigned to you yet'
                            }
                        </p>
                    </div>
                ) : (
                    groups.map(group => {
                        const groupStudents = students.filter(s => group.studentIds.includes(s.id));
                        const teacher = allUsers.find(u => u.id === group.teacherId);
                        const isExpanded = expandedGroup === group.id;
                        const isSelected = selectedGroup?.id === group.id;

                        return (
                            <div
                                key={group.id}
                                className={`glass-panel overflow-hidden transition-all ${isSelected ? 'border-2 border-amber-500/50 shadow-lg shadow-amber-500/10' : 'border border-white/5'
                                    }`}
                            >
                                {/* Group Header */}
                                <div
                                    className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                                    onClick={() => onSelectGroup(isSelected ? null : group)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isSelected
                                            ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30'
                                            : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                                            }`}>
                                            <GroupIcon sx={{ fontSize: 28, color: '#fff' }} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-white">{group.name}</h3>
                                            <p className="text-sm text-zinc-400">
                                                {teacher ? `Teacher: ${teacher.name}` : 'No teacher assigned'} • {groupStudents.length} students
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isHeadTeacher && (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingGroup(group);
                                                            setGroupForm({ name: group.name, teacherId: group.teacherId?.toString() || '' });
                                                            setFormError('');
                                                            setShowGroupForm(true);
                                                        }}
                                                        className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-amber-400"
                                                    >
                                                        <EditIcon sx={{ fontSize: 20 }} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteGroup(group.id);
                                                        }}
                                                        className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-400"
                                                    >
                                                        <DeleteIcon sx={{ fontSize: 20 }} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setExpandedGroup(isExpanded ? null : group.id);
                                                }}
                                                className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white"
                                            >
                                                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="border-t border-white/5 p-6 bg-black/20">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                                <PersonIcon sx={{ fontSize: 16 }} />
                                                Students ({groupStudents.length})
                                            </h4>
                                            {(isHeadTeacher || isTeacher) && (
                                                <button
                                                    onClick={() => setShowAddStudent(showAddStudent === group.id ? null : group.id)}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm transition-colors"
                                                >
                                                    <PersonAddIcon sx={{ fontSize: 16 }} />
                                                    Add Student
                                                </button>
                                            )}
                                        </div>

                                        {/* Add Student Dropdown */}
                                        {showAddStudent === group.id && (
                                            <div className="mb-4 p-4 bg-slate-800/50 rounded-xl border border-emerald-500/20">
                                                <p className="text-sm text-zinc-400 mb-2">Select a student to add:</p>
                                                <div className="flex gap-2 flex-wrap">
                                                    {getAvailableStudents(group).length === 0 ? (
                                                        <p className="text-amber-500/80 text-sm italic">All students are already in this group</p>
                                                    ) : (
                                                        getAvailableStudents(group).map(student => (
                                                            <button
                                                                key={student.id}
                                                                onClick={() => handleAddStudent(group.id, student.id)}
                                                                className="px-3 py-2 bg-white/5 hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-400 rounded-lg text-sm transition-colors border border-white/10 hover:border-emerald-500/30"
                                                            >
                                                                {student.name}
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Student List */}
                                        {groupStudents.length === 0 ? (
                                            <p className="text-zinc-500 text-sm text-center py-4">
                                                No students in this group yet
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {groupStudents.map(student => (
                                                    <div
                                                        key={student.id}
                                                        className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 group"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                                                            {student.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-white font-medium truncate">{student.name}</p>
                                                            <p className="text-xs text-zinc-500">@{student.username}</p>
                                                        </div>
                                                        {(isHeadTeacher || isTeacher) && (
                                                            <button
                                                                onClick={() => handleRemoveStudent(group.id, student.id)}
                                                                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-400 transition-all"
                                                            >
                                                                <PersonRemoveIcon sx={{ fontSize: 16 }} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default GroupManager;
