const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const supabase = require('../services/supabaseClient');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Sign Up User
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // Validasi input
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields: username, email, or password' });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    try {
        // Periksa apakah email sudah digunakan
        const { data: existingUsers, error: checkError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

        if (checkError) {
            console.error('Error checking existing user:', checkError);
            return res.status(500).json({ error: 'Error checking existing user' });
        }

        if (existingUsers && existingUsers.length > 0) {
            return res.status(400).json({ error: 'Email already registered.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tambahkan user baru
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{ username, email, password: hashedPassword }])
            .select('*');

        if (insertError) {
            console.error('Error inserting new user:', insertError);
            return res.status(500).json({ error: 'Error inserting new user' });
        }

        // Buat token JWT
        const token = jwt.sign({ id: newUser[0].id, email }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        });

        res.json({
            message: 'User signed up successfully',
            token,
        });
    } catch (error) {
        console.error('Error in /signup:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
        return res.status(400).json({ error: 'Missing required fields: email or password' });
    }

    try {
        // Tambahkan logging untuk email
        console.log('Fetching user with email:', email);

        // Periksa apakah email ada
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

        if (error) {
            console.error('Supabase Error:', error);
            return res.status(500).json({ error: 'Error fetching user', details: error.message });
        }

        if (!users || users.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const user = users[0];

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Buat token JWT
        const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        });

        res.json({
            message: 'Login successful',
            token,
        });
    } catch (error) {
        console.error('Error in /login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Middleware untuk verifikasi JWT
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: 'Missing token' });
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        req.user = decoded; // Simpan data user ke `req`
        next();
    } catch (error) {
        console.error('JWT verification error:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Redirect ke Google OAuth
router.get('/google', async (req, res) => {
    console.log('Google OAuth endpoint hit'); // Tambahkan log untuk debugging
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: 'https://pvjmtkgvivcnqxvugupy.supabase.co/auth/v1/callback',
        },
    });

    if (error) {
        console.error('OAuth error:', error.message);
        return res.status(400).json({ error: error.message });
    }

    res.redirect(data.url); // Redirect ke Google
});

router.get('/callback', async (req, res) => {
    const { access_token } = req.query;

    console.log('Access Token:', access_token); // Debug akses token

    if (!access_token) {
        return res.status(400).json({ error: 'Missing access token' });
    }

    try {
        // Ambil data pengguna dari Supabase
        const { data: user, error: userError } = await supabase.auth.getUser(access_token);

        console.log('User Data from Supabase:', user); // Debug data user
        console.error('Error Fetching User:', userError); // Debug jika ada error

        if (userError || !user) {
            console.error('Error fetching user info:', userError);
            return res.status(400).json({ error: 'Failed to fetch user info' });
        }

        const { email, user_metadata } = user;
        const username = user_metadata?.full_name || email.split('@')[0];

        // Periksa apakah pengguna sudah ada di tabel `users`
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        console.log('Existing User:', existingUser); // Debug user yang sudah ada
        console.error('Error Checking User Existence:', checkError); // Debug error

        if (!existingUser) {
            // Tambahkan pengguna baru ke tabel `users`
            const { error: insertError } = await supabase
                .from('users')
                .insert({ username, email, password: 'oauth_user' });

            console.error('User Insert Error:', insertError); // Debug error saat insert

            if (insertError) {
                console.error('Error inserting user:', insertError);
                return res.status(500).json({ error: 'Failed to insert user' });
            }

            console.log('User successfully added to the database!');
        }

        // Redirect ke halaman frontend setelah login berhasil
        res.redirect('/schedule'); // Redirect ke halaman schedule
    } catch (error) {
        console.error('Error in /callback:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Logout User
router.post('/logout', authenticateJWT, async (req, res) => {
    // Tidak ada aksi pada backend jika hanya menghapus token di client
    res.json({ message: 'Logged out successfully' });
});

module.exports = { router, authenticateJWT };
