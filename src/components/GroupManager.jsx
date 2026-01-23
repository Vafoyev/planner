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
import WarningIcon from '@mui/icons-material/Warning';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import EditNoteIcon from '@mui/icons-material/EditNote';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';

// Theme Colors (matching HeadTeacherDashboard)
const THEME = {
    primary: '#288FB2',
    primaryDark: '#1C5570',
    accent: '#F2D5A9',
    warning: '#FA3404',
    gradient: 'linear-gradient(135deg, #1C5570 0%, #288FB2 100%)',
    shadow: 'rgba(40, 143, 178, 0.35)'
};

// IELTS Skills for decoration
const SKILLS = [
    { name: 'Listening', icon: HeadphonesIcon, color: '#288FB2' },
    { name: 'Reading', icon: AutoStoriesIcon, color: '#1C5570' },
    { name: 'Writing', icon: EditNoteIcon, color: '#34D399' },
    { name: 'Speaking', icon: RecordVoiceOverIcon, color: '#FA3404' }
];

const GroupManager = ({ user, onSelectGroup, selectedGroup }) => {
    const [groups, setGroups] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedGroupDetail, setSelectedGroupDetail] = useState(null);

    // Form states
    const [showGroupForm, setShowGroupForm] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [groupForm, setGroupForm] = useState({ name: '', teacherId: '' });
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [formError, setFormError] = useState('');

    const isHeadTeacher = user?.role === 'headteacher';
    const isTeacher = user?.role === 'teacher';

    // Load data function
    const loadData = React.useCallback(() => {
        const allGroups = getGroups();
        const users = getUsers();

        // Filter groups based on role
        let filteredGroups = allGroups;
        if (user?.role === 'teacher') {
            filteredGroups = allGroups.filter(g => g.teacherId === user.id);
        }
        // Head teachers see all groups

        setGroups(filteredGroups);
        setAllUsers(users);
    }, [user]);

    // Load data on mount and when user changes
    useEffect(() => {
        loadData();
    }, [loadData]);

    const students = allUsers.filter(u => u.role === 'student');
    // Include both teachers and headteachers as potential group teachers
    const teachers = allUsers.filter(u => u.role === 'teacher' || u.role === 'headteacher');

    // Group CRUD
    const handleGroupSubmit = (e) => {
        e.preventDefault();
        setFormError('');
        if (!groupForm.teacherId) {
            setFormError('Please select a teacher for this group');
            return;
        }
        if (editingGroup) {
            updateGroup(editingGroup.id, { name: groupForm.name, teacherId: Number(groupForm.teacherId) });
        } else {
            createGroup({ name: groupForm.name, teacherId: Number(groupForm.teacherId), studentIds: [] });
        }
        setShowGroupForm(false);
        setEditingGroup(null);
        setGroupForm({ name: '', teacherId: '' });
        loadData();
    };

    const handleDeleteGroup = (groupId) => {
        if (window.confirm('Are you sure you want to delete this group?')) {
            deleteGroup(groupId);
            // Close modal first
            setSelectedGroupDetail(null);
            // Clear selection
            if (selectedGroup?.id === groupId) onSelectGroup(null);
            // Reload data to update UI
            const allGroups = getGroups();
            const users = getUsers();
            let filteredGroups = allGroups;
            if (user?.role === 'teacher') {
                filteredGroups = allGroups.filter(g => g.teacherId === user.id);
            }
            setGroups(filteredGroups);
            setAllUsers(users);
        }
    };

    const handleAddStudent = (groupId, studentId) => {
        addStudentToGroup(groupId, studentId);
        loadData();
        // Update selected group detail
        const updated = getGroups().find(g => g.id === groupId);
        if (updated) setSelectedGroupDetail(updated);
    };

    const handleRemoveStudent = (groupId, studentId) => {
        if (window.confirm('Remove this student from the group?')) {
            removeStudentFromGroup(groupId, studentId);
            loadData();
            const updated = getGroups().find(g => g.id === groupId);
            if (updated) setSelectedGroupDetail(updated);
        }
    };

    const getAvailableStudents = (group) => students.filter(s => !group.studentIds?.includes(s.id));

    const openGroupDetail = (group) => {
        setSelectedGroupDetail(group);
        onSelectGroup(group);
    };

    const closeGroupDetail = () => {
        setSelectedGroupDetail(null);
        setShowAddStudent(false);
    };

    return (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
            {/* Header */}
            <header style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--glass-border)',
                borderRadius: '20px',
                padding: 'clamp(20px, 4vw, 32px)',
                marginBottom: 'clamp(24px, 4vw, 32px)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${THEME.primary}, ${THEME.primaryDark}, #34D399, ${THEME.warning})`
                }} />

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '18px',
                        background: THEME.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 12px 32px ${THEME.shadow}`,
                        flexShrink: 0
                    }}>
                        <GroupIcon sx={{ fontSize: 32, color: 'white' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <h2 style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(22px, 4vw, 28px)',
                            fontWeight: 700,
                            color: 'var(--text-default)',
                            marginBottom: '4px'
                        }}>
                            Group Management
                        </h2>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                            {isHeadTeacher ? 'Create and manage IELTS study groups' : 'Manage your assigned groups'} • {groups.length} groups
                        </p>
                    </div>
                    {isHeadTeacher && (
                        <button
                            onClick={() => { setEditingGroup(null); setGroupForm({ name: '', teacherId: '' }); setFormError(''); setShowGroupForm(true); }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '14px 24px',
                                borderRadius: '14px',
                                border: 'none',
                                background: THEME.gradient,
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                boxShadow: `0 8px 24px ${THEME.shadow}`,
                                transition: 'all 0.2s'
                            }}
                        >
                            <GroupAddIcon sx={{ fontSize: 20 }} />
                            Create Group
                        </button>
                    )}
                </div>
            </header>

            {/* Groups Grid - Cards */}
            {groups.length === 0 ? (
                <div style={{
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(16px)',
                    border: '2px dashed var(--border-default)',
                    borderRadius: '24px',
                    padding: '80px 40px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 24px',
                        borderRadius: '50%',
                        background: 'var(--surface-default)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <GroupIcon sx={{ fontSize: 40, color: 'var(--text-subtle)' }} />
                    </div>
                    <h3 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-default)', marginBottom: '8px' }}>
                        No Groups Yet
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '300px', margin: '0 auto' }}>
                        {isHeadTeacher ? 'Create your first IELTS group to start organizing students' : 'No groups have been assigned to you yet'}
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 'clamp(16px, 3vw, 24px)'
                }}>
                    {groups.map((group, index) => {
                        const groupStudents = students.filter(s => group.studentIds?.includes(s.id));
                        const teacher = allUsers.find(u => u.id === group.teacherId);
                        const isSelected = selectedGroup?.id === group.id;
                        const skillIndex = index % 4;
                        const skill = SKILLS[skillIndex];

                        return (
                            <div
                                key={group.id}
                                onClick={() => openGroupDetail(group)}
                                style={{
                                    background: 'var(--glass-bg)',
                                    backdropFilter: 'blur(16px)',
                                    WebkitBackdropFilter: 'blur(16px)',
                                    border: isSelected ? `2px solid ${THEME.primary}` : '1px solid var(--glass-border)',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'all 0.25s ease',
                                    boxShadow: isSelected ? `0 8px 32px ${THEME.shadow}` : 'none'
                                }}
                            >
                                {/* Card Header with Gradient */}
                                <div style={{
                                    background: skill.color + '20',
                                    borderBottom: `1px solid ${skill.color}30`,
                                    padding: '20px',
                                    position: 'relative'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <div style={{
                                            width: '52px',
                                            height: '52px',
                                            borderRadius: '14px',
                                            background: `linear-gradient(135deg, ${skill.color}, ${skill.color}CC)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: `0 6px 20px ${skill.color}40`
                                        }}>
                                            <GroupIcon sx={{ fontSize: 26, color: 'white' }} />
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            gap: '4px'
                                        }}>
                                            {SKILLS.map((s, i) => (
                                                <div key={i} style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '6px',
                                                    background: s.color + '20',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <s.icon sx={{ fontSize: 12, color: s.color }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <h3 style={{
                                        fontSize: '18px',
                                        fontWeight: 700,
                                        color: 'var(--text-default)',
                                        marginTop: '16px',
                                        marginBottom: '4px'
                                    }}>
                                        {group.name}
                                    </h3>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <EmojiEventsIcon sx={{ fontSize: 14, color: THEME.accent }} />
                                        IELTS Preparation
                                    </p>
                                </div>

                                {/* Card Body */}
                                <div style={{ padding: '20px' }}>
                                    {/* Teacher Info */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 14px',
                                        background: 'var(--surface-default)',
                                        borderRadius: '12px',
                                        marginBottom: '16px'
                                    }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '10px',
                                            background: THEME.gradient,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <SchoolIcon sx={{ fontSize: 18, color: 'white' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Teacher</p>
                                            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-default)' }}>
                                                {teacher?.name || 'Not assigned'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stats Row */}
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                                        <div style={{
                                            flex: 1,
                                            textAlign: 'center',
                                            padding: '12px',
                                            background: `${THEME.primary}15`,
                                            borderRadius: '12px'
                                        }}>
                                            <p style={{ fontSize: '22px', fontWeight: 700, color: THEME.primary }}>{groupStudents.length}</p>
                                            <p style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-subtle)' }}>Students</p>
                                        </div>
                                        <div style={{
                                            flex: 1,
                                            textAlign: 'center',
                                            padding: '12px',
                                            background: '#34D39915',
                                            borderRadius: '12px'
                                        }}>
                                            <p style={{ fontSize: '22px', fontWeight: 700, color: '#34D399' }}>4</p>
                                            <p style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-subtle)' }}>Skills</p>
                                        </div>
                                    </div>

                                    {/* Student Avatars Preview */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex' }}>
                                            {groupStudents.slice(0, 4).map((student, i) => (
                                                <div
                                                    key={student.id}
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        background: `linear-gradient(135deg, ${SKILLS[i % 4].color}, ${SKILLS[i % 4].color}CC)`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontSize: '12px',
                                                        fontWeight: 700,
                                                        marginLeft: i > 0 ? '-8px' : 0,
                                                        border: '2px solid var(--bg-base)',
                                                        zIndex: 4 - i
                                                    }}
                                                >
                                                    {student.name.charAt(0).toUpperCase()}
                                                </div>
                                            ))}
                                            {groupStudents.length > 4 && (
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    background: 'var(--surface-default)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'var(--text-muted)',
                                                    fontSize: '10px',
                                                    fontWeight: 700,
                                                    marginLeft: '-8px',
                                                    border: '2px solid var(--bg-base)'
                                                }}>
                                                    +{groupStudents.length - 4}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            color: THEME.primary,
                                            fontSize: '13px',
                                            fontWeight: 600
                                        }}>
                                            View
                                            <ArrowForwardIcon sx={{ fontSize: 16 }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Group Detail Modal */}
            {selectedGroupDetail && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 100,
                        padding: '20px'
                    }}
                    onClick={closeGroupDetail}
                >
                    <div
                        style={{
                            background: 'var(--glass-bg)',
                            backdropFilter: 'blur(24px)',
                            border: `2px solid ${THEME.primary}`,
                            borderRadius: '24px',
                            width: '100%',
                            maxWidth: '600px',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            animation: 'fadeIn 0.2s ease'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div style={{
                            background: THEME.gradient,
                            padding: '28px',
                            position: 'relative'
                        }}>
                            <button
                                onClick={closeGroupDetail}
                                style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    background: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <CloseIcon sx={{ fontSize: 20 }} />
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <GroupIcon sx={{ fontSize: 32, color: 'white' }} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                                        {selectedGroupDetail.name}
                                    </h2>
                                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <EmojiEventsIcon sx={{ fontSize: 16 }} />
                                        IELTS Preparation Course
                                    </p>
                                </div>
                            </div>

                            {/* IELTS Skills Bar */}
                            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                                {SKILLS.map((skill, i) => (
                                    <div key={i} style={{
                                        flex: 1,
                                        padding: '10px',
                                        background: 'rgba(255,255,255,0.15)',
                                        borderRadius: '10px',
                                        textAlign: 'center'
                                    }}>
                                        <skill.icon sx={{ fontSize: 20, color: 'white' }} />
                                        <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.8)', marginTop: '4px', textTransform: 'uppercase' }}>
                                            {skill.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '24px' }}>
                            {/* Teacher Info */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '16px',
                                background: 'var(--surface-default)',
                                borderRadius: '14px',
                                marginBottom: '24px'
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: THEME.gradient,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <SchoolIcon sx={{ fontSize: 24, color: 'white' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '12px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned Teacher</p>
                                    <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-default)' }}>
                                        {allUsers.find(u => u.id === selectedGroupDetail.teacherId)?.name || 'Not assigned'}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FBBF24' }}>
                                    <StarIcon sx={{ fontSize: 16 }} />
                                    <span style={{ fontWeight: 700 }}>4.8</span>
                                </div>
                            </div>

                            {/* Students Section */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <PersonIcon sx={{ fontSize: 18 }} />
                                    Students ({students.filter(s => selectedGroupDetail.studentIds?.includes(s.id)).length})
                                </h4>
                                {(isHeadTeacher || isTeacher) && (
                                    <button
                                        onClick={() => setShowAddStudent(!showAddStudent)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '8px 14px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            background: '#34D39920',
                                            color: '#34D399',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <PersonAddIcon sx={{ fontSize: 16 }} />
                                        Add
                                    </button>
                                )}
                            </div>

                            {/* Add Student Panel */}
                            {showAddStudent && (
                                <div style={{
                                    padding: '16px',
                                    background: '#34D39910',
                                    border: '1px solid #34D39930',
                                    borderRadius: '12px',
                                    marginBottom: '16px'
                                }}>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>Select students to add:</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {getAvailableStudents(selectedGroupDetail).length === 0 ? (
                                            <p style={{ fontSize: '13px', color: '#FBBF24', fontStyle: 'italic' }}>All students are already in this group</p>
                                        ) : (
                                            getAvailableStudents(selectedGroupDetail).map(student => (
                                                <button
                                                    key={student.id}
                                                    onClick={() => handleAddStudent(selectedGroupDetail.id, student.id)}
                                                    style={{
                                                        padding: '8px 14px',
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--border-default)',
                                                        background: 'var(--surface-default)',
                                                        color: 'var(--text-default)',
                                                        fontSize: '13px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {student.name}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Students List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {students.filter(s => selectedGroupDetail.studentIds?.includes(s.id)).length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                        <PersonIcon sx={{ fontSize: 32, opacity: 0.3, marginBottom: '8px' }} />
                                        <p>No students in this group yet</p>
                                    </div>
                                ) : (
                                    students.filter(s => selectedGroupDetail.studentIds?.includes(s.id)).map((student, i) => (
                                        <div
                                            key={student.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '14px',
                                                padding: '14px',
                                                background: 'var(--surface-default)',
                                                border: '1px solid var(--border-default)',
                                                borderRadius: '12px'
                                            }}
                                        >
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '12px',
                                                background: `linear-gradient(135deg, ${SKILLS[i % 4].color}, ${SKILLS[i % 4].color}CC)`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: 700,
                                                fontSize: '16px'
                                            }}>
                                                {student.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-default)' }}>{student.name}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>@{student.username}</p>
                                            </div>
                                            {(isHeadTeacher || isTeacher) && (
                                                <button
                                                    onClick={() => handleRemoveStudent(selectedGroupDetail.id, student.id)}
                                                    style={{
                                                        padding: '8px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #EF444440',
                                                        background: '#EF444410',
                                                        color: '#EF4444',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <PersonRemoveIcon sx={{ fontSize: 16 }} />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Action Buttons */}
                            {isHeadTeacher && (
                                <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-default)' }}>
                                    <button
                                        onClick={() => {
                                            setEditingGroup(selectedGroupDetail);
                                            setGroupForm({ name: selectedGroupDetail.name, teacherId: selectedGroupDetail.teacherId?.toString() || '' });
                                            setShowGroupForm(true);
                                            closeGroupDetail();
                                        }}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            padding: '14px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border-default)',
                                            background: 'var(--surface-default)',
                                            color: 'var(--text-muted)',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <EditIcon sx={{ fontSize: 18 }} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteGroup(selectedGroupDetail.id)}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            padding: '14px',
                                            borderRadius: '12px',
                                            border: '1px solid #EF4444',
                                            background: '#EF444410',
                                            color: '#EF4444',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <DeleteIcon sx={{ fontSize: 18 }} />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Group Modal */}
            {showGroupForm && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 100,
                        padding: '20px'
                    }}
                    onClick={() => setShowGroupForm(false)}
                >
                    <div
                        style={{
                            background: 'var(--glass-bg)',
                            backdropFilter: 'blur(24px)',
                            border: `2px solid ${THEME.primary}`,
                            borderRadius: '24px',
                            width: '100%',
                            maxWidth: '500px',
                            overflow: 'hidden',
                            animation: 'fadeIn 0.2s ease'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div style={{
                            background: THEME.gradient,
                            padding: '24px 28px',
                            position: 'relative'
                        }}>
                            <button
                                onClick={() => setShowGroupForm(false)}
                                style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    background: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <CloseIcon sx={{ fontSize: 18 }} />
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{
                                    width: '52px',
                                    height: '52px',
                                    borderRadius: '14px',
                                    background: 'rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {editingGroup ? <EditIcon sx={{ fontSize: 26, color: 'white' }} /> : <GroupAddIcon sx={{ fontSize: 26, color: 'white' }} />}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '2px' }}>
                                        {editingGroup ? 'Edit Group' : 'Create New Group'}
                                    </h3>
                                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                                        {editingGroup ? 'Update group details' : 'Add a new IELTS study group'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '28px' }}>
                            {formError && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '14px 16px',
                                    background: '#EF444415',
                                    border: '1px solid #EF444450',
                                    borderRadius: '12px',
                                    marginBottom: '20px'
                                }}>
                                    <WarningIcon sx={{ fontSize: 20, color: '#EF4444' }} />
                                    <span style={{ color: '#EF4444', fontSize: '14px', fontWeight: 500 }}>{formError}</span>
                                </div>
                            )}

                            <form onSubmit={handleGroupSubmit}>
                                {/* Group Name Input */}
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: 'var(--text-muted)',
                                        marginBottom: '10px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        <GroupIcon sx={{ fontSize: 16 }} />
                                        Group Name
                                    </label>
                                    <input
                                        type="text"
                                        value={groupForm.name}
                                        onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                                        placeholder="e.g., IELTS Morning Class"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '16px 18px',
                                            borderRadius: '14px',
                                            border: '1px solid var(--border-default)',
                                            background: 'var(--surface-default)',
                                            color: 'var(--text-default)',
                                            fontSize: '15px',
                                            fontWeight: 500,
                                            outline: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                    />
                                </div>

                                {/* Teacher Selection */}
                                <div style={{ marginBottom: '28px' }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: 'var(--text-muted)',
                                        marginBottom: '10px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        <SchoolIcon sx={{ fontSize: 16 }} />
                                        Assign Teacher <span style={{ color: '#EF4444' }}>*</span>
                                    </label>

                                    {/* Quick Assign: Myself Option */}
                                    {isHeadTeacher && (
                                        <button
                                            type="button"
                                            onClick={() => setGroupForm({ ...groupForm, teacherId: user.id.toString() })}
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '14px 16px',
                                                marginBottom: '12px',
                                                borderRadius: '12px',
                                                border: groupForm.teacherId === user.id.toString()
                                                    ? `2px solid ${THEME.primary}`
                                                    : '1px solid var(--border-default)',
                                                background: groupForm.teacherId === user.id.toString()
                                                    ? `${THEME.primary}15`
                                                    : 'var(--surface-default)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px',
                                                background: THEME.gradient,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: `0 4px 12px ${THEME.shadow}`
                                            }}>
                                                <PersonIcon sx={{ fontSize: 20, color: 'white' }} />
                                            </div>
                                            <div style={{ flex: 1, textAlign: 'left' }}>
                                                <p style={{
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    color: groupForm.teacherId === user.id.toString() ? THEME.primary : 'var(--text-default)',
                                                    marginBottom: '2px'
                                                }}>
                                                    👤 Assign to Myself
                                                </p>
                                                <p style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                                                    {user.name} (Head Teacher)
                                                </p>
                                            </div>
                                            {groupForm.teacherId === user.id.toString() && (
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    background: THEME.primary,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <SaveIcon sx={{ fontSize: 14, color: 'white' }} />
                                                </div>
                                            )}
                                        </button>
                                    )}

                                    {/* Or Divider */}
                                    {isHeadTeacher && teachers.length > 1 && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            margin: '16px 0',
                                            color: 'var(--text-subtle)',
                                            fontSize: '12px'
                                        }}>
                                            <div style={{ flex: 1, height: '1px', background: 'var(--border-default)' }} />
                                            <span>or select another teacher</span>
                                            <div style={{ flex: 1, height: '1px', background: 'var(--border-default)' }} />
                                        </div>
                                    )}

                                    {/* Teacher Select Dropdown */}
                                    <select
                                        value={groupForm.teacherId}
                                        onChange={(e) => setGroupForm({ ...groupForm, teacherId: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '16px 18px',
                                            borderRadius: '14px',
                                            border: '1px solid var(--border-default)',
                                            background: 'var(--surface-default)',
                                            color: 'var(--text-default)',
                                            fontSize: '15px',
                                            fontWeight: 500,
                                            outline: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="">-- Select a Teacher --</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>
                                                {t.name} {t.role === 'headteacher' ? '(Head Teacher)' : '(Teacher)'} - @{t.username}
                                            </option>
                                        ))}
                                    </select>
                                    <p style={{ fontSize: '12px', color: 'var(--text-subtle)', marginTop: '8px' }}>
                                        💡 The assigned teacher will be able to manage this group and its students
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowGroupForm(false)}
                                        style={{
                                            flex: 1,
                                            padding: '16px',
                                            borderRadius: '14px',
                                            border: '1px solid var(--border-default)',
                                            background: 'var(--surface-default)',
                                            color: 'var(--text-muted)',
                                            fontSize: '15px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            padding: '16px',
                                            borderRadius: '14px',
                                            border: 'none',
                                            background: THEME.gradient,
                                            color: 'white',
                                            fontSize: '15px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            boxShadow: `0 8px 24px ${THEME.shadow}`,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <SaveIcon sx={{ fontSize: 20 }} />
                                        {editingGroup ? 'Update Group' : 'Create Group'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupManager;
