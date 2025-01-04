// const express = require('express');
// const router = express.Router();
// const jwt = require('jsonwebtoken');
// const supabase = require('../services/supabaseClient');
// require('dotenv').config();

// // Sign Up User
// router.post('/signup', async (req, res) => {
//     const { name, email } = req.body;

//     if (!name || !email) {
//         return res.status(400).json({ error: 'Missing required fields: name or email' });
//     }

//     try {
//         // Periksa apakah email sudah digunakan
//         const { data: existingUser, error: checkError } = await supabase
//             .from('users')
//             .select('*')
//             .eq('email', email)
//             .single();

//         if (existingUser) {
//             return res.status(400).json({ error: 'Email already registered.' });
//         }

//         if (checkError && checkError.details.includes('No rows found') === false) {
//             return res.status(500).json({ error: checkError.message });
//         }

//         // Tambahkan user baru
//         const { data: newUser, error: insertError } = await supabase
//             .from('users')
//             .insert([{ name, email }])
//             .select('*');

//         if (insertError) {
//             return res.status(500).json({ error: insertError.message });
//         }

//         // Buat token JWT
//         const token = jwt.sign({ id: newUser[0].id, email }, process.env.JWT_SECRET, {
//             expiresIn: process.env.JWT_EXPIRES_IN,
//         });

//         res.json({
//             message: 'User signed up successfully',
//             token,
//         });
//     } catch (error) {
//         console.error('Error in /signup:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// // Login User
// router.post('/login', async (req, res) => {
//     const { email } = req.body;

//     if (!email) {
//         return res.status(400).json({ error: 'Missing required field: email' });
//     }

//     try {
//         // Periksa apakah email ada
//         const { data: user, error } = await supabase
//             .from('users')
//             .select('*')
//             .eq('email', email)
//             .single();

//         if (!user) {
//             return res.status(404).json({ error: 'User not found.' });
//         }

//         if (error) {
//             return res.status(500).json({ error: error.message });
//         }

//         // Buat token JWT
//         const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, {
//             expiresIn: process.env.JWT_EXPIRES_IN,
//         });

//         res.json({
//             message: 'Login successful',
//             token,
//         });
//     } catch (error) {
//         console.error('Error in /login:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// // Middleware untuk verifikasi JWT
// const authenticateJWT = (req, res, next) => {
//     const token = req.headers['authorization'];

//     if (!token) {
//         return res.status(401).json({ error: 'Missing token' });
//     }

//     try {
//         const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
//         req.user = decoded; // Simpan data user ke `req`
//         next();
//     } catch (error) {
//         console.error('JWT verification error:', error);
//         return res.status(401).json({ error: 'Invalid or expired token' });
//     }
// };

// module.exports = { router, authenticateJWT };
