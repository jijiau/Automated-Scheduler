const supabase = require('../services/supabaseClient');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function authenticateService(req, res, next) {
    try {
        const apiKey = req.headers['x-api-key']; // API Key dari header
        console.log('Received API Key:', apiKey);

        if (!apiKey) {
            return res.status(401).json({ error: 'Missing API Key' });
        }

        // Cek API Key di tabel `services`
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('api_key', apiKey)
            .single();

        if (error || !data) {
            // Jika tidak ditemukan di tabel, cek fallback ke SUPABASE_SERVICE_ROLE_KEY
            if (apiKey !== SUPABASE_SERVICE_ROLE_KEY) {
                console.error('Invalid API Key:', apiKey);
                return res.status(401).json({ error: 'Unauthorized' });
            }

            console.log('API Key validated using fallback.');
            next();
        } else {
            // API Key valid di tabel `services`
            console.log('Authenticated service:', data.name);
            req.serviceName = data.name; // Simpan nama layanan untuk rute berikutnya
            next();
        }
    } catch (error) {
        console.error('Error in authenticateService middleware:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = authenticateService;
