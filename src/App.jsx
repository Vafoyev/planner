import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ScheduleView from './components/ScheduleView';
import StatsDashboard from './components/StatsDashboard';
import StudentManager from './components/StudentManager';
import DashboardHome from './components/DashboardHome';
import Login from './components/Login';

// Initial empty state
const INITIAL_DATA = {
  students: [],
  tasks: {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  }
};


function App() {
  /* 
    User State Structure:
    {
      role: 'teacher' | 'student',
      name: string,
      id: number | null
    } 
  */
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ielts_auth_v2');
    return saved ? JSON.parse(saved) : null;
  });

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('ielts_academy_v4');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  // Derived state for compatibility with existing components
  const userMode = user?.role || 'student'; // Default safe fallback
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    localStorage.setItem('ielts_academy_v4', JSON.stringify(data));
  }, [data]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('ielts_auth_v2', JSON.stringify(userData));
    // If student, check if they are added to the class yet
    if (userData.role === 'student') {
      const studentExists = data.students.find(s => s.id == userData.id || s.username === userData.username);
      if (!studentExists) {
        // Do not auto-create. They see empty view until teacher adds them.
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ielts_auth_v2');
    setCurrentView('schedule');
    setSelectedStudent(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Student Management
  const handleAddStudent = (userObj) => {
    // Check duplication
    if (data.students.some(s => s.id === userObj.id)) return;

    const newStudent = {
      id: userObj.id,
      name: userObj.name,
      username: userObj.username,
      email: userObj.email,
      scores: {}
    };
    setData(prev => ({
      ...prev,
      students: [...prev.students, newStudent]
    }));
  };

  const handleDeleteStudent = (studentId) => {
    setData(prev => ({
      ...prev,
      students: prev.students.filter(s => s.id !== studentId)
    }));
    if (selectedStudent?.id === studentId) {
      setSelectedStudent(null);
    }
  };

  // Task Management (by Teacher)
  const handleAddTask = (day, newTask) => {
    setData(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [day]: [...prev.tasks[day], {
          ...newTask,
          id: Date.now(),
          maxScore: newTask.maxScore || 10
        }]
      }
    }));
  };

  const handleUpdateTask = (day, updatedTask) => {
    setData(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [day]: prev.tasks[day].map(task =>
          task.id === updatedTask.id ? updatedTask : task
        )
      }
    }));
  };

  const handleDeleteTask = (day, taskId) => {
    setData(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [day]: prev.tasks[day].filter(task => task.id !== taskId)
      }
    }));
  };

  // Score Management (per student per task)
  const handleUpdateScore = (studentId, taskId, score) => {
    setData(prev => ({
      ...prev,
      students: prev.students.map(student => {
        if (student.id === studentId) {
          return {
            ...student,
            scores: {
              ...student.scores,
              [taskId]: score
            }
          };
        }
        return student;
      })
    }));
  };

  const handleImportData = (importedData) => {
    if (importedData && importedData.students && importedData.tasks) {
      setData(importedData);
      alert('Data imported successfully!');
    } else {
      alert('Invalid data format.');
    }
  };

  return (
    <Layout
      currentView={currentView}
      setCurrentView={setCurrentView}
      userMode={userMode}
      user={user}
      students={data.students}
      selectedStudent={selectedStudent}
      setSelectedStudent={setSelectedStudent}
      onLogout={handleLogout}
    >
      {currentView === 'dashboard' ? (
        <DashboardHome
          userMode={userMode}
          students={data.students}
          tasks={data.tasks}
        />
      ) : currentView === 'students' && userMode === 'teacher' ? (
        <StudentManager
          students={data.students}
          fullData={data}
          onAddStudent={handleAddStudent}
          onDeleteStudent={handleDeleteStudent}
          selectedStudent={selectedStudent}
          setSelectedStudent={setSelectedStudent}
          onImportData={handleImportData}
        />
      ) : currentView === 'schedule' ? (
        <ScheduleView
          tasks={data.tasks}
          students={data.students}
          selectedStudent={selectedStudent}
          onUpdateTask={handleUpdateTask}
          onAddTask={handleAddTask}
          onDeleteTask={handleDeleteTask}
          onUpdateScore={handleUpdateScore}
          userMode={userMode}
        />
      ) : currentView === 'statistics' ? (
        <StatsDashboard
          tasks={data.tasks}
          students={data.students}
          selectedStudent={selectedStudent}
        />
      ) : null}
    </Layout>
  );
}

export default App;
