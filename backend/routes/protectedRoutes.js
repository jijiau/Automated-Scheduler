const express = require('express');
const router = express.Router();
const authenticateService = require('../middlewares/authenticateService');
const supabase = require('../services/supabaseClient');
const crypto = require('crypto');

// Rute dilindungi dengan authenticateService
// Example protected route using authenticateService
router.get('/protected-resource', authenticateService, (req, res) => {
    res.json({ message: `Welcome ${req.serviceName}, you are authorized to access this resource.` });
});

// Rute dilindungi untuk validasi API Key
router.get('/resource', authenticateService, (req, res) => {
    res.json({ message: `Welcome ${req.serviceName}, you have access to this resource.` });
});

// Rute untuk sign up service baru
router.post('/signup', async (req, res) => {
    try {
        const { name } = req.body;

        // Validate input
        if (!name) {
            console.error('Missing required field: name');
            return res.status(400).json({ error: 'Missing required field: name' });
        }

        // Check if the service name already exists
        const { data: existingService, error: checkError } = await supabase
            .from('services')
            .select('*')
            .eq('name', name)
            .single();

        if (!checkError && existingService) {
            console.error('Service name already exists:', name);
            return res.status(400).json({ error: 'Service name already exists.' });
        }

        // Generate unique API Key
        const apiKey = crypto.randomBytes(16).toString('hex'); // 32-character key

        // Save the service in the database
        const { data, error } = await supabase
            .from('services')
            .insert([{ name, api_key: apiKey }])
            .select('*');

        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({ error: error.message });
        }

        console.log('Service signed up successfully:', data);

        // Provide response with instructions
        res.json({
            message: 'Sign up successful. Store your API Key securely and include it in the x-api-key header for all future requests.',
            service: {
                name: data[0].name,
                api_key: data[0].api_key, // Show API key for the first time
            },
        });
    } catch (error) {
        console.error('Unexpected error in POST /signup:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
