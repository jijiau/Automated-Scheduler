const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const supabase = require('../services/supabaseClient');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Sign Up untuk Public Users
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields: username, email, or password' });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    try {
        const { data: existingUsers, error: checkError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

        if (existingUsers && existingUsers.length > 0) {
            return res.status(400).json({ error: 'Email already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{ username, email, password: hashedPassword }])
            .select('*');

        if (insertError) {
            return res.status(500).json({ error: 'Error inserting new user' });
        }

        const token = jwt.sign({ id: newUser[0].id, email, source: 'public' }, process.env.JWT_SECRET, {
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

// Login untuk Public Users
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Missing required fields: email or password' });
    }

    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

        if (!users || users.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = jwt.sign({ id: user.id, email, source: 'public' }, process.env.JWT_SECRET, {
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

// Redirect Google OAuth Login
router.get('/google', async (req, res) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'http://localhost:3000/auth/callback' },
    });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.redirect(data.url);
});

router.get('/callback', async (req, res) => {
    const urlFragment = req.originalUrl.split('#')[1];
    const params = new URLSearchParams(urlFragment);
    const access_token = params.get('access_token');

    if (!access_token) {
        console.error('Access Token is missing');
        return res.status(400).json({ error: 'Access token is missing' });
    }

    try {
        // Ambil data pengguna dari Supabase menggunakan access_token
        const { data: user, error: userError } = await supabase.auth.getUser(access_token);

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

        if (!existingUser) {
            // Tambahkan pengguna baru ke tabel `users`
            const { error: insertError } = await supabase
                .from('users')
                .insert({ username, email, password: 'oauth_user' });

            if (insertError) {
                console.error('Error inserting user:', insertError);
                return res.status(500).json({ error: 'Failed to insert user' });
            }
            console.log('User successfully added to the database!');
        } else {
            console.log('User already exists:', existingUser);
        }

        // Redirect pengguna ke halaman schedule
        res.redirect('/schedule');
    } catch (error) {
        console.error('Error in /callback:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Middleware untuk Verifikasi JWT
const authenticateJWT = async (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: 'Missing token' });
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        const { id, source } = decoded;

        if (source === 'public') {
            const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
            if (!data || error) return res.status(401).json({ error: 'User not found' });
            req.user = data;
        } else if (source === 'auth') {
            const { data, error } = await supabase.from('auth.users').select('*').eq('id', id).single();
            if (!data || error) return res.status(401).json({ error: 'User not found' });
            req.user = data;
        } else {
            return res.status(401).json({ error: 'Invalid source in token' });
        }

        next();
    } catch (error) {
        console.error('JWT verification error:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

router.post('/logout', authenticateJWT, (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

module.exports = { router, authenticateJWT };
