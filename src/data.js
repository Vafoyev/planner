// Initial seed data for the application
// Super Admin can create users via Admin Panel

export const SUPER_ADMIN = {
  id: 0,
  role: 'superadmin',
  username: 'superadmin',
  password: 'super123',
  name: 'Super Administrator'
};

// Initialize the database with super admin only
export const initializeDatabase = () => {
  // Check if already initialized
  const existingUsers = localStorage.getItem('edu_users');
  
  if (!existingUsers) {
    // First time - create super admin
    localStorage.setItem('edu_users', JSON.stringify([SUPER_ADMIN]));
    localStorage.setItem('edu_groups', JSON.stringify([]));
    localStorage.setItem('edu_app_data', JSON.stringify({
      tasks: {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: []
      }
    }));
  }
};

// User management functions
export const getUsers = () => {
  return JSON.parse(localStorage.getItem('edu_users') || '[]');
};

export const getGroups = () => {
  return JSON.parse(localStorage.getItem('edu_groups') || '[]');
};

export const getAppData = () => {
  return JSON.parse(localStorage.getItem('edu_app_data') || '{"tasks":{}}');
};

export const saveUsers = (users) => {
  localStorage.setItem('edu_users', JSON.stringify(users));
};

export const saveGroups = (groups) => {
  localStorage.setItem('edu_groups', JSON.stringify(groups));
};

export const saveAppData = (data) => {
  localStorage.setItem('edu_app_data', JSON.stringify(data));
};

// Create a new user
export const createUser = (userData) => {
  const users = getUsers();
  const newUser = {
    id: Date.now(),
    ...userData,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

// Delete a user
export const deleteUser = (userId) => {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== userId && u.role !== 'superadmin');
  saveUsers(filtered);
  
  // Also remove from groups
  const groups = getGroups();
  const updatedGroups = groups.map(g => ({
    ...g,
    studentIds: g.studentIds.filter(id => id !== userId),
    teacherId: g.teacherId === userId ? null : g.teacherId
  }));
  saveGroups(updatedGroups);
};

// Update user
export const updateUser = (userId, updates) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
    return users[index];
  }
  return null;
};

// Create a new group
export const createGroup = (groupData) => {
  const groups = getGroups();
  const newGroup = {
    id: Date.now(),
    ...groupData,
    studentIds: groupData.studentIds || [],
    createdAt: new Date().toISOString()
  };
  groups.push(newGroup);
  saveGroups(groups);
  return newGroup;
};

// Delete a group
export const deleteGroup = (groupId) => {
  const groups = getGroups();
  saveGroups(groups.filter(g => g.id !== groupId));
};

// Update group
export const updateGroup = (groupId, updates) => {
  const groups = getGroups();
  const index = groups.findIndex(g => g.id === groupId);
  if (index !== -1) {
    groups[index] = { ...groups[index], ...updates };
    saveGroups(groups);
    return groups[index];
  }
  return null;
};

// Authenticate user
export const authenticateUser = (username, password, role) => {
  const users = getUsers();
  return users.find(u => 
    u.username === username && 
    u.password === password && 
    u.role === role
  );
};

// Authenticate super admin
export const authenticateSuperAdmin = (username, password) => {
  const users = getUsers();
  return users.find(u => 
    u.username === username && 
    u.password === password && 
    u.role === 'superadmin'
  );
};

// Get users by role
export const getUsersByRole = (role) => {
  return getUsers().filter(u => u.role === role);
};

// Get students in a group
export const getStudentsInGroup = (groupId) => {
  const group = getGroups().find(g => g.id === groupId);
  if (!group) return [];
  const users = getUsers();
  return users.filter(u => group.studentIds.includes(u.id));
};

// Add student to group
export const addStudentToGroup = (groupId, studentId) => {
  const groups = getGroups();
  const index = groups.findIndex(g => g.id === groupId);
  if (index !== -1 && !groups[index].studentIds.includes(studentId)) {
    groups[index].studentIds.push(studentId);
    saveGroups(groups);
    return groups[index];
  }
  return null;
};

// Remove student from group
export const removeStudentFromGroup = (groupId, studentId) => {
  const groups = getGroups();
  const index = groups.findIndex(g => g.id === groupId);
  if (index !== -1) {
    groups[index].studentIds = groups[index].studentIds.filter(id => id !== studentId);
    saveGroups(groups);
    return groups[index];
  }
  return null;
};
