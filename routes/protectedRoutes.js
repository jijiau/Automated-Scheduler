const express = require('express');
const router = express.Router();
const authenticateService = require('../middlewares/authenticateService');
const validateApiKey = require('../middlewares/validateApiKey');
const supabase = require('../services/supabaseClient');

// Rute dilindungi dengan authenticateService
router.get('/protected-resource', authenticateService, (req, res) => {
    res.json({ message: 'This is a protected resource' });
});

// Rute dilindungi dengan validateApiKey
router.get('/resource', validateApiKey, (req, res) => {
    res.json({ message: `Welcome ${req.serviceName}, you have access to this resource.` });
});

// Rute POST untuk menambahkan data
router.post('/add', authenticateService, async (req, res) => {
    try {
        const { name, api_key } = req.body;

        // Debugging: Log request body
        console.log('Request body:', req.body);

        // Validasi input
        if (!name || !api_key) {
            console.error('Missing required fields:', { name, api_key });
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Simpan data ke tabel `services` dan kembalikan data yang disimpan
        const { data, error } = await supabase
            .from('services')
            .insert([
                {
                    name: name,
                    api_key: api_key,
                },
            ])
            .select('*'); // Tambahkan ini untuk mengembalikan data

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

module.exports = router;
