import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { initializeDatabase, getGroups, getUsers, getAppData, saveAppData } from './data';
import Layout from './components/Layout';
import ScheduleView from './components/ScheduleView';
import StatsDashboard from './components/StatsDashboard';
import StudentManager from './components/StudentManager';
import GroupManager from './components/GroupManager';
import DashboardHome from './components/DashboardHome';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';

// Initialize database on app load
initializeDatabase();

function App() {
  // Auth State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('edu_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAdminMode, setIsAdminMode] = useState(false);

  // App State
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Data State
  const [appData, setAppData] = useState(() => getAppData());
  const [groups, setGroups] = useState(() => getGroups());
  const [allUsers, setAllUsers] = useState(() => getUsers());

  // Reload data when needed
  const reloadData = () => {
    setGroups(getGroups());
    setAllUsers(getUsers());
    setAppData(getAppData());
  };

  useEffect(() => {
    reloadData();
  }, [user]);

  // Persist app data
  useEffect(() => {
    saveAppData(appData);
  }, [appData]);

  // Get students based on context
  const getStudents = () => {
    const students = allUsers.filter(u => u.role === 'student');

    if (selectedGroup) {
      return students.filter(s => selectedGroup.studentIds.includes(s.id));
    }

    // For teachers, show students from their groups
    if (user?.role === 'teacher') {
      const teacherGroups = groups.filter(g => g.teacherId === user.id);
      const studentIds = new Set(teacherGroups.flatMap(g => g.studentIds));
      return students.filter(s => studentIds.has(s.id));
    }

    return students;
  };

  // Login handlers
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('edu_current_user', JSON.stringify(userData));
    setIsAdminMode(false);
    reloadData();
  };

  const handleAdminLogin = (adminData) => {
    setUser(adminData);
    localStorage.setItem('edu_current_user', JSON.stringify(adminData));
    setIsAdminMode(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdminMode(false);
    localStorage.removeItem('edu_current_user');
    setCurrentView('dashboard');
    setSelectedGroup(null);
    setSelectedStudent(null);
  };

  // Task Management
  const handleAddTask = (day, newTask) => {
    setAppData(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [day]: [...(prev.tasks[day] || []), {
          ...newTask,
          id: Date.now(),
          groupId: selectedGroup?.id || null,
          maxScore: newTask.maxScore || 10,
          createdBy: user?.id
        }]
      }
    }));
  };

  const handleUpdateTask = (day, updatedTask) => {
    setAppData(prev => ({
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
    setAppData(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [day]: prev.tasks[day].filter(task => task.id !== taskId)
      }
    }));
  };

  // Score Management
  const handleUpdateScore = (studentId, taskId, score) => {
    // Store scores in appData
    setAppData(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [`${studentId}_${taskId}`]: score
      }
    }));
  };

  // Get student with scores
  const getStudentWithScores = (student) => {
    if (!student) return null;
    const scores = {};
    Object.entries(appData.scores || {}).forEach(([key, value]) => {
      if (key.startsWith(`${student.id}_`)) {
        const taskId = key.split('_')[1];
        scores[taskId] = value;
      }
    });
    return { ...student, scores };
  };

  // Not logged in
  if (!user) {
    return (
      <ThemeProvider>
        <Login onLogin={handleLogin} onAdminLogin={handleAdminLogin} />
      </ThemeProvider>
    );
  }

  // Admin Panel Mode
  if (isAdminMode || user.role === 'superadmin') {
    return (
      <ThemeProvider>
        <AdminPanel onLogout={handleLogout} />
      </ThemeProvider>
    );
  }

  const userMode = user.role === 'headteacher' ? 'teacher' : user.role;
  const students = getStudents();
  const enrichedStudent = getStudentWithScores(selectedStudent);

  // Filter tasks for students
  const getFilteredTasks = () => {
    if (user.role === 'student') {
      // Show only tasks assigned to student's groups
      const studentGroups = groups.filter(g => g.studentIds.includes(user.id));
      const groupIds = new Set(studentGroups.map(g => g.id));

      const filteredTasks = {};
      Object.entries(appData.tasks || {}).forEach(([day, dayTasks]) => {
        filteredTasks[day] = dayTasks.filter(task =>
          !task.groupId || groupIds.has(task.groupId)
        );
      });
      return filteredTasks;
    }

    // For teachers, optionally filter by selected group
    if (selectedGroup) {
      const filteredTasks = {};
      Object.entries(appData.tasks || {}).forEach(([day, dayTasks]) => {
        filteredTasks[day] = dayTasks.filter(task =>
          !task.groupId || task.groupId === selectedGroup.id
        );
      });
      return filteredTasks;
    }

    return appData.tasks || {};
  };

  return (
    <ThemeProvider>
      <Layout
        currentView={currentView}
        setCurrentView={setCurrentView}
        userMode={userMode}
        user={user}
        groups={groups}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        students={students}
        selectedStudent={selectedStudent}
        setSelectedStudent={setSelectedStudent}
        onLogout={handleLogout}
      >
        {currentView === 'dashboard' ? (
          <DashboardHome
            userMode={userMode}
            user={user}
            students={students}
            tasks={getFilteredTasks()}
            groups={groups}
          />
        ) : currentView === 'groups' && userMode === 'teacher' ? (
          <GroupManager
            user={user}
            selectedGroup={selectedGroup}
            onSelectGroup={setSelectedGroup}
          />
        ) : currentView === 'students' && userMode === 'teacher' ? (
          <StudentManager
            students={students}
            groups={groups}
            selectedGroup={selectedGroup}
            user={user}
            fullData={appData}
            onReload={reloadData}
          />
        ) : currentView === 'schedule' ? (
          <ScheduleView
            tasks={getFilteredTasks()}
            students={students}
            selectedStudent={enrichedStudent}
            selectedGroup={selectedGroup}
            onUpdateTask={handleUpdateTask}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onUpdateScore={handleUpdateScore}
            userMode={userMode}
            user={user}
            appData={appData}
          />
        ) : currentView === 'statistics' ? (
          <StatsDashboard
            tasks={getFilteredTasks()}
            students={students.map(s => getStudentWithScores(s))}
            selectedStudent={enrichedStudent}
            selectedGroup={selectedGroup}
            groups={groups}
            userMode={userMode}
            user={user}
          />
        ) : null}
      </Layout>
    </ThemeProvider>
  );
}

export default App;
