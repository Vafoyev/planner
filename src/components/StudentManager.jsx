import React, { useState } from 'react';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CloseIcon from '@mui/icons-material/Close';

const StudentManager = ({
    students,
    onAddStudent,
    onDeleteStudent,
    selectedStudent,
    setSelectedStudent
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');

    const handleAdd = () => {
        if (newName.trim()) {
            onAddStudent(newName.trim());
            setNewName('');
            setIsAdding(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleAdd();
        if (e.key === 'Escape') {
            setIsAdding(false);
            setNewName('');
        }
    };

    return (
        <div className="student-manager">
            {/* Header */}
            <header className="page-glass-header mb-8">
                <div className="header-icon-glass">
                    <SchoolIcon sx={{ fontSize: 28, color: '#f59e0b' }} />
                </div>
                <div>
                    <h2 className="text-2xl font-serif text-white">Student Management</h2>
                    <p className="text-sm text-zinc-400 font-sans mt-1">Add students and track their progress</p>
                </div>
            </header>

            {/* Stats */}
            <div className="stats-row mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <PersonIcon sx={{ fontSize: 28, color: '#a78bfa' }} />
                    </div>
                    <div>
                        <span className="text-3xl font-bold text-white block">{students.length}</span>
                        <span className="text-sm text-zinc-400 uppercase tracking-wider">Total Students</span>
                    </div>
                </div>
            </div>

            {/* Add Student Button */}
            {isAdding ? (
                <div className="glass-panel p-6 mb-8 border-amber-500/20 border-2">
                    <div className="flex gap-4 items-center flex-wrap">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Enter student name..."
                            autoFocus
                            className="glass-input flex-1 min-w-[200px]"
                        />
                        <button onClick={handleAdd} className="glass-btn-primary">
                            Add Student
                        </button>
                        <button
                            onClick={() => { setIsAdding(false); setNewName(''); }}
                            className="p-3 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <CloseIcon sx={{ fontSize: 22 }} />
                        </button>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsAdding(true)} 
                    className="glass-btn-primary mb-8 w-full md:w-auto"
                >
                    <PersonAddIcon sx={{ fontSize: 22 }} />
                    <span>Add New Student</span>
                </button>
            )}

            {/* Student List */}
            <div className="student-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.length === 0 ? (
                    <div className="col-span-full glass-panel p-16 text-center border-2 border-dashed border-white/5">
                        <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-6">
                            <PersonIcon sx={{ fontSize: 48, color: '#475569' }} />
                        </div>
                        <h3 className="text-xl font-serif text-white mb-2">No Students Yet</h3>
                        <p className="text-zinc-500 text-sm max-w-md mx-auto">
                            Click the button above to add your first student and start tracking their progress
                        </p>
                    </div>
                ) : (
                    students.map((student, index) => (
                        <div
                            key={student.id}
                            className={`glass-panel p-6 cursor-pointer transition-all duration-300 group ${
                                selectedStudent?.id === student.id 
                                    ? 'border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-900/20' 
                                    : 'hover:border-white/20 hover:bg-white/5'
                            }`}
                            onClick={() => setSelectedStudent(student)}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`student-avatar w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl transition-all ${
                                    selectedStudent?.id === student.id
                                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30'
                                        : 'bg-gradient-to-br from-purple-500 to-purple-600 group-hover:scale-110'
                                }`}>
                                    <span>{student.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-lg font-semibold text-white truncate mb-1">{student.name}</h4>
                                    <p className="text-xs text-zinc-400 uppercase tracking-wider">Student #{index + 1}</p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`Are you sure you want to delete ${student.name}?`)) {
                                            onDeleteStudent(student.id);
                                        }
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                                    title="Delete Student"
                                >
                                    <DeleteIcon sx={{ fontSize: 20 }} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentManager;
