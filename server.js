require('dotenv').config();
const express = require('express');
const app = express();
const protectedRoutes = require('./routes/protectedRoutes');

app.use(express.json());

// Tambahkan logging middleware di awal
app.use((req, res, next) => {
    console.log('Incoming Request Headers:', req.headers);
    next();
});

// Rute bebas
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the public route!' });
});

// Rute yang dilindungi
app.use('/protected', protectedRoutes);

// Jalankan server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
