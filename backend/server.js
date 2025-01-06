require('dotenv').config(); // Load variabel dari .env
const express = require('express');
const cors = require('cors');
const app = express();

// Import rute
const protectedRoutes = require('./routes/protectedRoutes'); // Rute autentikasi
const taskRoutes = require('./routes/taskRoutes'); // Rute untuk tugas
const scheduleRoutes = require('./routes/scheduleRoutes'); // Rute untuk jadwal otomatis
const authRoutes = require('./routes/authRoutes').router; // Rute otentikasi

// Middleware umum
app.use(cors());
app.use(express.json());

// Rute bebas
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the public route!' });
});

// Rute yang dilindungi
app.use('/protected', protectedRoutes);

// Rute otentikasi
app.use('/auth', authRoutes);
console.log('Auth routes loaded');

// Rute tugas dan jadwal
app.use('/tasks', taskRoutes); // Untuk operasi tugas
app.use('/schedule', scheduleRoutes); // Untuk operasi jadwal

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));