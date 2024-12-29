const express = require('express');
const router = express.Router();
const authenticateService = require('../middlewares/authenticateService');
const supabase = require('../services/supabaseClient');
const crypto = require('crypto');

// Rute dilindungi dengan authenticateService
router.get('/protected-resource', authenticateService, (req, res) => {
    res.json({ message: 'This is a protected resource' });
});

// Rute dilindungi untuk validasi API Key
router.get('/resource', authenticateService, (req, res) => {
    res.json({ message: `Welcome ${req.serviceName}, you have access to this resource.` });
});

// Rute POST untuk menambahkan data ke tabel `services`
router.post('/add', authenticateService, async (req, res) => {
    try {
        const { name, api_key } = req.body;

        // Debugging: Log request body
        console.log('Request body received:', req.body);

        // Validasi input
        if (!name || !api_key) {
            console.error('Missing required fields:', { name, api_key });
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Simpan data ke tabel `services`
        const { data, error } = await supabase
            .from('services')
            .insert([
                {
                    name: name,
                    api_key: api_key,
                },
            ])
            .select('*'); // Mengembalikan data yang disimpan

        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({ error: error.message });
        }

        console.log('Service added successfully:', data);
        res.json({ message: 'Service added successfully', data });
    } catch (error) {
        console.error('Unexpected error in POST /add:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Rute untuk sign up service baru
router.post('/signup', async (req, res) => {
    try {
        const { name } = req.body;

        // Validasi input
        if (!name) {
            console.error('Missing required field: name');
            return res.status(400).json({ error: 'Missing required field: name' });
        }

        // Periksa apakah nama service sudah ada
        const { data: existingService, error: checkError } = await supabase
            .from('services')
            .select('*')
            .eq('name', name)
            .single();

        if (checkError === null && existingService) {
            console.error('Service name already exists:', name);
            return res.status(400).json({ error: 'Service name already exists.' });
        }

        // Generate API Key unik
        const apiKey = crypto.randomBytes(16).toString('hex'); // Panjang 32 karakter

        // Simpan data ke tabel `services`
        const { data, error } = await supabase
            .from('services')
            .insert([
                {
                    name: name,
                    api_key: apiKey,
                },
            ])
            .select('*'); // Mengembalikan data yang disimpan

        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({ error: error.message });
        }

        console.log('Service signed up successfully:', data);
        res.json({
            message: 'Sign up successful. Here is your API Key.',
            data: {
                name: data[0].name,
                api_key: data[0].api_key,
            },
        });
    } catch (error) {
        console.error('Unexpected error in POST /signup:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
