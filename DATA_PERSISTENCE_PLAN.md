# Data Persistence Plan - English Study Academy

## Current Implementation

### LocalStorage Structure

#### 1. User Authentication (`ielts_auth_v2`)
```json
{
  "role": "teacher" | "student",
  "name": "User Name",
  "id": 1234567890
}
```

#### 2. Teachers Data (`teachers`)
```json
[
  {
    "id": 1234567890,
    "username": "teacher1",
    "email": "teacher@example.com",
    "name": "Teacher Name",
    "password": "hashed_password"
  }
]
```

#### 3. Students Data (`students`)
```json
[
  {
    "id": 1234567890,
    "name": "Student Name",
    "email": "student@example.com"
  }
]
```

#### 4. Academy Data (`ielts_academy_v4`)
```json
{
  "students": [
    {
      "id": 1234567890,
      "name": "Student Name",
      "scores": {
        "taskId1": 85,
        "taskId2": 92
      }
    }
  ],
  "tasks": {
    "Monday": [
      {
        "id": 1234567890,
        "title": "Task Title",
        "maxScore": 40,
        "deadline": "18:00",
        "date": "2024-12-01T00:00:00.000Z"
      }
    ],
    "Tuesday": [],
    "Wednesday": [],
    "Thursday": [],
    "Friday": [],
    "Saturday": [],
    "Sunday": []
  }
}
```

## Migration to Cloud Database

### Recommended Solution: Supabase

#### Why Supabase?
- ✅ Free tier with generous limits
- ✅ PostgreSQL database (industry standard)
- ✅ Built-in authentication
- ✅ Real-time subscriptions
- ✅ Row Level Security (RLS)
- ✅ RESTful API auto-generated
- ✅ Easy to integrate with React

### Database Schema

#### 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. Tasks Table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  day TEXT NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  max_score INTEGER DEFAULT 40,
  deadline TIME,
  task_date DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. Scores Table
```sql
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0),
  max_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, task_id)
);
```

#### 4. Authentication (Supabase Auth)
- Managed by Supabase Auth
- JWT tokens for API requests
- Email/password authentication
- Optional: OAuth providers (Google, GitHub, etc.)

### Migration Script

```javascript
// migration-script.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrateData() {
  // 1. Migrate Teachers
  const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
  for (const teacher of teachers) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: teacher.email,
        name: teacher.name,
        role: 'teacher'
      });
  }

  // 2. Migrate Students
  const academyData = JSON.parse(localStorage.getItem('ielts_academy_v4') || '{}');
  for (const student of academyData.students) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: student.name,
        role: 'student'
      });
  }

  // 3. Migrate Tasks
  for (const [day, tasks] of Object.entries(academyData.tasks || {})) {
    for (const task of tasks) {
      const { data: taskData, error } = await supabase
        .from('tasks')
        .insert({
          title: task.title,
          day: day,
          max_score: task.maxScore,
          deadline: task.deadline,
          task_date: task.date
        });
    }
  }

  // 4. Migrate Scores
  for (const student of academyData.students) {
    for (const [taskId, score] of Object.entries(student.scores || {})) {
      // Find student and task IDs
      const { data: scoreData, error } = await supabase
        .from('scores')
        .insert({
          student_id: studentId,
          task_id: taskId,
          score: score,
          max_score: maxScore
        });
    }
  }
}
```

## Implementation Steps

### Phase 1: Setup Supabase
1. Create Supabase account
2. Create new project
3. Run SQL schema scripts
4. Enable Row Level Security (RLS)
5. Configure authentication settings

### Phase 2: Install Dependencies
```bash
npm install @supabase/supabase-js
```

### Phase 3: Create Supabase Client
```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Phase 4: Replace LocalStorage with Supabase

#### Authentication
```javascript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password
});

// Register
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
  options: {
    data: {
      name: name,
      role: role
    }
  }
});
```

#### Data Operations
```javascript
// Fetch students
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('role', 'student');

// Create task
const { data, error } = await supabase
  .from('tasks')
  .insert({
    title: title,
    day: day,
    max_score: maxScore
  });

// Update score
const { data, error } = await supabase
  .from('scores')
  .upsert({
    student_id: studentId,
    task_id: taskId,
    score: score,
    max_score: maxScore
  });
```

### Phase 5: Add Real-time Subscriptions
```javascript
// Subscribe to score changes
const subscription = supabase
  .channel('scores')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'scores' },
    (payload) => {
      // Update UI with new score
    }
  )
  .subscribe();
```

## Data Backup Strategy

### Automatic Backups
- Supabase provides automatic daily backups
- Point-in-time recovery available
- Backup retention: 7 days (free tier), 30+ days (paid)

### Manual Export
```javascript
// Export all data
async function exportData() {
  const { data: students } = await supabase.from('users').select('*').eq('role', 'student');
  const { data: tasks } = await supabase.from('tasks').select('*');
  const { data: scores } = await supabase.from('scores').select('*');
  
  return {
    students,
    tasks,
    scores
  };
}
```

## Rollback Plan

### If Migration Fails
1. Keep localStorage as fallback
2. Implement feature flag to switch between localStorage and Supabase
3. Gradual migration (start with new data, migrate old data later)

```javascript
// Feature flag
const USE_CLOUD_DB = import.meta.env.VITE_USE_CLOUD_DB === 'true';

if (USE_CLOUD_DB) {
  // Use Supabase
} else {
  // Use localStorage
}
```

## Security Considerations

### Row Level Security (RLS) Policies

```sql
-- Teachers can only see their own students
CREATE POLICY "Teachers can view students"
ON users FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'teacher'
  ) AND role = 'student'
);

-- Students can only see their own scores
CREATE POLICY "Students can view own scores"
ON scores FOR SELECT
USING (auth.uid() = student_id);
```

## Cost Estimation

### Supabase Free Tier
- Database: 500 MB
- API requests: 50,000/month
- File storage: 1 GB
- Auth users: Unlimited

### Supabase Pro ($25/month)
- Database: 8 GB
- API requests: Unlimited
- File storage: 100 GB
- Daily backups

## Timeline

### Week 1: Setup
- Create Supabase project
- Design and implement database schema
- Setup authentication

### Week 2: Migration
- Implement Supabase client
- Replace localStorage with Supabase calls
- Test data operations

### Week 3: Testing & Deployment
- Test all functionality
- Performance testing
- Deploy to production

### Week 4: Cleanup
- Remove localStorage code
- Update documentation
- Monitor and optimize

---

**Status**: Planning Phase
**Recommended Implementation**: Supabase
**Priority**: High (for production use)
