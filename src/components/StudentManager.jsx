import React, { useState, useEffect } from 'react';
import {
    getUsers,
    getGroups,
    addStudentToGroup,
    removeStudentFromGroup
} from '../data';

import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

const StudentManager = ({
    students,
    groups,
    selectedGroup,
    user,
    fullData,
    onReload
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [availableStudents, setAvailableStudents] = useState([]);

    const isHeadTeacher = user?.role === 'headteacher';
    const isTeacher = user?.role === 'teacher';

    // Get teacher's groups
    const teacherGroups = isHeadTeacher
        ? groups
        : groups.filter(g => g.teacherId === user?.id);

    useEffect(() => {
        if (isAdding && selectedGroupId) {
            const allUsers = getUsers();
            const group = groups.find(g => g.id === Number(selectedGroupId));

            // Filter: Role is student AND not already in the selected group
            const available = allUsers.filter(u =>
                u.role === 'student' && !group?.studentIds?.includes(u.id)
            );

            setAvailableStudents(available);
            if (available.length > 0) setSelectedUserId(available[0].id);
        }
    }, [isAdding, selectedGroupId, groups]);

    const handleAdd = () => {
        if (selectedUserId && selectedGroupId) {
            addStudentToGroup(Number(selectedGroupId), Number(selectedUserId));
            setIsAdding(false);
            setSelectedUserId('');
            setSelectedGroupId('');
            onReload();
        }
    };

    const handleRemove = (groupId, studentId) => {
        if (window.confirm('Remove this student from the group?')) {
            removeStudentFromGroup(groupId, studentId);
            onReload();
        }
    };

    // Group students by their groups
    const getStudentsWithGroups = () => {
        const allUsers = getUsers();
        const studentMap = {};

        students.forEach(student => {
            const studentGroups = groups.filter(g => g.studentIds?.includes(student.id));
            studentMap[student.id] = {
                ...student,
                groups: studentGroups
            };
        });

        return Object.values(studentMap);
    };

    const studentsWithGroups = getStudentsWithGroups();

    return (
        <div className="student-manager">
            {/* Header */}
            <header className="page-glass-header mb-8">
                <div className="header-icon-glass">
                    <SchoolIcon sx={{ fontSize: 28, color: '#f59e0b' }} />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-serif text-white">Student Management</h2>
                    <p className="text-sm text-zinc-400 font-sans mt-1">
                        {selectedGroup
                            ? `Viewing students in ${selectedGroup.name}`
                            : 'Manage students across all your groups'
                        }
                    </p>
                </div>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-panel p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <PersonIcon sx={{ fontSize: 28, color: '#a78bfa' }} />
                    </div>
                    <div>
                        <span className="text-3xl font-bold text-white block">{students.length}</span>
                        <span className="text-sm text-zinc-400 uppercase tracking-wider">Total Students</span>
                    </div>
                </div>

                <div className="glass-panel p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <GroupIcon sx={{ fontSize: 28, color: '#60a5fa' }} />
                    </div>
                    <div>
                        <span className="text-3xl font-bold text-white block">{teacherGroups.length}</span>
                        <span className="text-sm text-zinc-400 uppercase tracking-wider">Your Groups</span>
                    </div>
                </div>

                <div className="glass-panel p-6 flex items-center justify-center">
                    <button
                        onClick={() => {
                            setIsAdding(true);
                            if (teacherGroups.length > 0) {
                                setSelectedGroupId(teacherGroups[0].id.toString());
                            }
                        }}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all"
                    >
                        <PersonAddIcon sx={{ fontSize: 20 }} />
                        Add Student to Group
                    </button>
                </div>
            </div>

            {/* Add Student Form */}
            {isAdding && (
                <div className="glass-panel p-6 mb-8 border-amber-500/20 border-2">
                    <h4 className="text-white mb-4 font-semibold flex items-center gap-2">
                        <PersonAddIcon sx={{ fontSize: 20, color: '#f59e0b' }} />
                        Add Student to Group
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        {/* Group Selector */}
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Select Group</label>
                            <select
                                value={selectedGroupId}
                                onChange={(e) => setSelectedGroupId(e.target.value)}
                                className="glass-input w-full bg-slate-800"
                            >
                                <option value="">-- Select Group --</option>
                                {teacherGroups.map(g => (
                                    <option key={g.id} value={g.id}>
                                        {g.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Student Selector */}
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Select Student</label>
                            {selectedGroupId ? (
                                availableStudents.length > 0 ? (
                                    <select
                                        value={selectedUserId}
                                        onChange={(e) => setSelectedUserId(e.target.value)}
                                        className="glass-input w-full bg-slate-800"
                                    >
                                        {availableStudents.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} (@{u.username})
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="glass-input bg-amber-500/10 text-amber-500 text-sm">
                                        All students are already in this group
                                    </div>
                                )
                            ) : (
                                <div className="glass-input bg-slate-800/50 text-zinc-500 text-sm">
                                    Select a group first
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleAdd}
                                disabled={!selectedUserId || !selectedGroupId}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PersonAddIcon sx={{ fontSize: 18 }} />
                                Add
                            </button>
                            <button
                                onClick={() => {
                                    setIsAdding(false);
                                    setSelectedUserId('');
                                    setSelectedGroupId('');
                                }}
                                className="p-3 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <CloseIcon />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Student List */}
            {students.length === 0 ? (
                <div className="glass-panel p-16 text-center border-2 border-dashed border-white/5">
                    <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-6">
                        <PersonIcon sx={{ fontSize: 48, color: '#475569' }} />
                    </div>
                    <h3 className="text-xl font-serif text-white mb-2">No Students Yet</h3>
                    <p className="text-zinc-500 text-sm max-w-md mx-auto">
                        Add students to your groups to start tracking their progress
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studentsWithGroups.map((student) => (
                        <div
                            key={student.id}
                            className="glass-panel p-6 hover:border-white/20 transition-all group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                    {student.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-lg font-semibold text-white truncate">{student.name}</h4>
                                    <p className="text-sm text-zinc-500">@{student.username}</p>
                                </div>
                            </div>

                            {/* Groups */}
                            <div className="space-y-2">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider">Groups:</p>
                                {student.groups.length === 0 ? (
                                    <p className="text-sm text-zinc-600 italic">Not assigned to any group</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {student.groups.map(group => (
                                            <div
                                                key={group.id}
                                                className="flex items-center gap-1 px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg text-xs"
                                            >
                                                <GroupIcon sx={{ fontSize: 12 }} />
                                                {group.name}
                                                {(isHeadTeacher || group.teacherId === user?.id) && (
                                                    <button
                                                        onClick={() => handleRemove(group.id, student.id)}
                                                        className="ml-1 p-0.5 hover:bg-red-500/20 rounded text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <CloseIcon sx={{ fontSize: 12 }} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentManager;
