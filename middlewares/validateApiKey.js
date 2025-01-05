const supabase = require('../services/supabaseClient');

async function validateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).json({ error: 'Missing API Key' });
    }

    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('api_key', apiKey)
        .single();

    if (error || !data) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    req.serviceName = data.name; // Simpan nama layanan untuk rute berikutnya
    next();
}

module.exports = validateApiKey; // Ekspor middleware sebagai fungsi
