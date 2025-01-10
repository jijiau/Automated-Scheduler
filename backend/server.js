require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Import rute
const protectedRoutes = require('./routes/protectedRoutes'); // Rute autentikasi
const taskRoutes = require('./routes/taskRoutes'); // Rute untuk tugas
const scheduleRoutes = require('./routes/scheduleRoutes'); // Rute untuk jadwal otomatis
const authRoutes = require('./routes/authRoutes').router;

// Middleware

// Enable CORS
app.use(cors({
    origin: ['https://www.taskly.web.id', 'https://automated-scheduler.vercel.app', 'http://localhost:3000'], // Allow frontend URLs
    credentials: true,
}));

app.use(express.json());

// Rute bebas
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the public route!' });
});

// Rute yang dilindungi
app.use('/protected', protectedRoutes);

app.use('/auth', authRoutes);

// Rute tugas dan jadwal
app.use('/tasks', taskRoutes); // Untuk operasi tugas
app.use('/schedule', scheduleRoutes); // Untuk operasi jadwal

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
