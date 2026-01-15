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
            <header className="page-header">
                <div className="header-icon">
                    <SchoolIcon sx={{ fontSize: 28, color: '#fff' }} />
                </div>
                <div>
                    <h2>O'quvchilar ro'yxati</h2>
                    <p>O'quvchilarni qo'shing va ularning progressini kuzating</p>
                </div>
            </header>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-box">
                    <PersonIcon sx={{ fontSize: 24, color: '#8b5cf6' }} />
                    <div>
                        <span className="stat-number">{students.length}</span>
                        <span className="stat-label">Jami o'quvchilar</span>
                    </div>
                </div>
            </div>

            {/* Add Student Button */}
            {isAdding ? (
                <div className="add-form">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="O'quvchi ismini kiriting..."
                        autoFocus
                        className="add-input"
                    />
                    <button onClick={handleAdd} className="btn-add">
                        Qo'shish
                    </button>
                    <button
                        onClick={() => { setIsAdding(false); setNewName(''); }}
                        className="btn-cancel"
                    >
                        <CloseIcon sx={{ fontSize: 20 }} />
                    </button>
                </div>
            ) : (
                <button onClick={() => setIsAdding(true)} className="add-student-btn">
                    <PersonAddIcon sx={{ fontSize: 22 }} />
                    <span>Yangi o'quvchi qo'shish</span>
                </button>
            )}

            {/* Student List */}
            <div className="student-list">
                {students.length === 0 ? (
                    <div className="empty-state">
                        <PersonIcon sx={{ fontSize: 64, color: '#4b5563' }} />
                        <h3>Hali o'quvchilar yo'q</h3>
                        <p>Birinchi o'quvchini qo'shish uchun yuqoridagi tugmani bosing</p>
                    </div>
                ) : (
                    students.map((student, index) => (
                        <div
                            key={student.id}
                            className={`student-card ${selectedStudent?.id === student.id ? 'selected' : ''}`}
                            onClick={() => setSelectedStudent(student)}
                        >
                            <div className="student-avatar">
                                <span>{student.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="student-info">
                                <h4>{student.name}</h4>
                                <p>O'quvchi #{index + 1}</p>
                            </div>
                            <div className="student-actions">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteStudent(student.id);
                                    }}
                                    className="btn-delete"
                                    title="Delete"
                                >
                                    <DeleteIcon sx={{ fontSize: 18 }} />
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
