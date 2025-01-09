    const express = require('express');
    const router = express.Router();
    const jwt = require('jsonwebtoken');
    const supabase = require('../services/supabaseClient');
    const bcrypt = require('bcrypt');
    const crypto = require('crypto');
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

            const token = jwt.sign({ id: newUser[0].id, email, role: 'user', source: 'public' }, process.env.JWT_SECRET, {
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

    // Sign Up untuk Public Users
    router.post('/service-signup', async (req, res) => {
        const { name } = req.body;

        // Validasi input
        if (!name) {
            return res.status(400).json({ error: 'Missing required field: name' });
        }

        try {
            // Periksa apakah nama layanan sudah ada di database
            const { data: existingService, error: checkError } = await supabase
                .from('services')
                .select('id')
                .eq('name', name)
                .limit(1); // Hindari penggunaan .single() untuk hasil kosong atau banyak baris

            // Tangani error pengecekan nama layanan
            if (checkError) {
                console.error('Supabase Error while checking service name:', checkError);
                return res.status(500).json({ error: 'Error checking service name' });
            }

            // Jika nama layanan sudah terdaftar
            if (existingService && existingService.length > 0) {
                return res.status(400).json({ error: 'Service name already registered.' });
            }

            // Generate API Key unik
            const apiKey = crypto.randomBytes(16).toString('hex'); // Panjang 32 karakter

            // Simpan data layanan baru ke database
            const { data: newService, error: insertError } = await supabase
                .from('services')
                .insert([{ name, api_key: apiKey }])
                .select('*')
                .single();

            // Jika terjadi error saat insert
            if (insertError) {
                console.error('Supabase Error while inserting new service:', insertError);
                return res.status(500).json({ error: 'Error inserting new service' });
            }

            // Buat token JWT untuk service yang baru
            const token = jwt.sign(
                { id: newService.id, name, api_key: apiKey, role: 'service' },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
            );

            // Berikan respons sukses
            res.json({
                message: 'Service registered successfully',
                service: {
                    id: newService.id,
                    name: newService.name,
                },
                api_key: apiKey,
                token,
            });
        } catch (error) {
            console.error('Unexpected Error in /service-signup:', error);
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

            const token = jwt.sign({ id: user.id, email, role: 'user', source: 'public' }, process.env.JWT_SECRET, {
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

    router.post('/service-login', async (req, res) => {
        const { api_key } = req.body;

        if (!api_key) {
            return res.status(400).json({ error: 'Missing API key' });
        }

        try {
            // Check the service in the database
            const { data: service, error } = await supabase
                .from('services')
                .select('*')
                .eq('api_key', api_key)
                .single();

            if (error || !service) {
                return res.status(401).json({ error: 'Invalid API key' });
            }

            // Generate a token
            const token = jwt.sign(
                { id: service.id, name: service.name, api_key: service.api_key, role: 'service' },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
            );

            res.json({
                message: 'Service login successful',
                token,
            });
        } catch (err) {
            console.error('Unexpected error in /service-login:', err);
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
                // Validate user token (for registered users)
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', id)
                    .single();
                if (!data || error) return res.status(401).json({ error: 'User not found' });
                req.user = data; // Attach user details to request
            } else if (source === 'auth') {
                // Validate OAuth token (e.g., Google users)
                const { data, error } = await supabase
                    .from('auth.users')
                    .select('*')
                    .eq('id', id)
                    .single();
                if (!data || error) return res.status(401).json({ error: 'OAuth user not found' });
                req.user = data; // Attach OAuth user details to request
            } else if (source === 'service') {
                // Validate service token (for external services)
                const { data, error } = await supabase
                    .from('services')
                    .select('*')
                    .eq('id', id)
                    .single();
                if (!data || error) return res.status(401).json({ error: 'Service not found' });
                req.service = data; // Attach service details to request
            } else {
                return res.status(401).json({ error: 'Invalid source in token' });
            }

            next(); // Proceed to the next middleware
        } catch (error) {
            console.error('JWT verification error:', error);
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    };

    router.post('/logout', authenticateJWT, (req, res) => {
        res.json({ message: 'Logged out successfully' });
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

    module.exports = { router, authenticateJWT };
