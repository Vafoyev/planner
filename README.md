# 🎓 English Academy - Education Management System

Modern va professional ta'lim boshqaruv tizimi React va Vite asosida yaratilgan.

## ✨ Asosiy Xususiyatlar

### 🔐 Foydalanuvchi Rollari
- **Super Admin** - Tizimni to'liq boshqarish
- **Head Teacher** - O'quv ishlari bo'yicha boshqaruv
- **Teacher** - Guruhlar va talabalarni boshqarish
- **Student** - O'z natijalarini ko'rish

### 📚 Funksiyalar
- ✅ **Dashboard** - Real-time statistika va hisobotlar
- ✅ **Group Management** - Guruhlarni yaratish va boshqarish
- ✅ **Student Management** - Talabalarni boshqarish
- ✅ **Schedule View** - Haftalik dars jadvali va topshiriqlar
- ✅ **Statistics** - Chart.js bilan vizual statistika
- ✅ **Task Management** - Topshiriqlar yaratish va baholar berish
- ✅ **Dark/Light Theme** - Tungi va kunduzgi rejim
- ✅ **Responsive Design** - Barcha qurilmalarda ishlaydi

## 🛠️ Texnologiyalar

- **Frontend**: React 19
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **UI Components**: Material-UI (@mui/material)
- **Icons**: Material Icons & Lucide React
- **Charts**: Chart.js & React-chartjs-2
- **Data Storage**: LocalStorage (frontend only)
- **Deployment**: Netlify

## 🚀 O'rnatish va Ishga Tushirish

### 1. Dependency'larni o'rnatish
```bash
npm install
```

### 2. Development serverini ishga tushirish
```bash
npm run dev
```
Server `http://localhost:5173` da ishga tushadi

### 3. Production build
```bash
npm run build
```

### 4. Production preview
```bash
npm run preview
```

## 🔑 Login Ma'lumotlari

### Super Admin
- **Username**: `superadmin`
- **Password**: `super123`

Super Admin orqali boshqa foydalanuvchilar (teachers, students) yaratish mumkin.

## 📁 Proyekt Strukturasi

```
planner/
├── src/
│   ├── components/          # React komponentlar
│   │   ├── AdminPanel.jsx   # Admin panel
│   │   ├── DashboardHome.jsx # Asosiy dashboard
│   │   ├── GroupManager.jsx  # Guruh boshqaruvi
│   │   ├── Layout.jsx        # Asosiy layout
│   │   ├── Login.jsx         # Login sahifasi
│   │   ├── ScheduleView.jsx  # Jadval ko'rinishi
│   │   ├── StatsDashboard.jsx # Statistika
│   │   ├── StudentManager.jsx # Talaba boshqaruvi
│   │   └── TaskCard.jsx      # Task kartochkasi
│   ├── context/
│   │   └── ThemeContext.jsx  # Theme context
│   ├── styles/
│   │   └── index.css         # Global styles
│   ├── data.js               # Data management
│   ├── App.jsx               # Asosiy App
│   └── main.jsx              # Entry point
├── public/                   # Static fayllar
├── dist/                     # Build fayllari
└── netlify.toml             # Netlify konfiguratsiyasi
```

## 🌐 Deployment (Netlify)

Loyiha Netlify'da ishlash uchun to'liq sozlangan:

1. GitHub repository'ga push qiling:
```bash
git add .
git commit -m "Update project"
git push origin main
```

2. Netlify'da repository'ni ulang
3. Build settings avtomatik aniqlanadi (`netlify.toml` orqali)
4. Deploy tugmachasini bosing!

## 🎨 Theme

Loyihada **Dark** va **Light** mode mavjud:
- Default: Dark mode
- O'zgartirish: Layout'dagi theme toggle button orqali
- Ma'lumot localStorage'da saqlanadi

## 📊 Ma'lumotlar Saqlash

Hozirda ma'lumotlar **localStorage**'da saqlanadi:
- `edu_users` - Foydalanuvchilar
- `edu_groups` - Guruhlar
- `edu_app_data` - Topshiriqlar va baholar
- `edu_current_user` - Joriy foydalanuvchi
- `edu_theme` - Theme sozlamalari

## 🔄 Kelajak Rejalar

- [ ] Backend API integratsiyasi
- [ ] Database (MongoDB/PostgreSQL)
- [ ] Real-time updates (WebSocket)
- [ ] File upload functionality
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Multi-language support

## 📝 Litsenziya

© 2026 English Academy. Barcha huquqlar himoyalangan.

## 👨‍💻 Developer

GitHub: [@Vafoyev](https://github.com/Vafoyev)

---

**Deployed on Netlify** | **Built with ❤️ using React + Vite**
