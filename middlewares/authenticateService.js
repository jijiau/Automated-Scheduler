const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Middleware untuk validasi API Key
function authenticateService(req, res, next) {
    const apiKey = req.headers['x-api-key']; // Ambil API Key dari header
    console.log('Received API Key:', apiKey); // Debugging

    // Validasi API Key
    if (!apiKey || apiKey !== SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    next(); // Jika valid, lanjutkan ke rute berikutnya
}

module.exports = authenticateService; // Ekspor middleware sebagai fungsi
