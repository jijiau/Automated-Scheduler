// Gunakan variabel lingkungan yang telah diatur di Railway
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.JWT_SECRET) {
    console.error("Missing required environment variables. Ensure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and JWT_SECRET are set.");
    process.exit(1);
}

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
app.use(cors());
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
