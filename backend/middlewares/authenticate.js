const jwt = require('jsonwebtoken');
const supabase = require('../services/supabaseClient');

const authenticate = async (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        console.error('No token provided.');
        return res.status(401).json({ error: 'Missing token' });
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        console.log('Decoded token:', decoded); // Log the decoded token

        const { id, role } = decoded;

        if (role === 'user') {
            // Fetch user from the 'users' table
            const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
            if (!data || error) {
                console.error('Error fetching user:', error);
                return res.status(401).json({ error: 'User not found' });
            }
            req.authType = 'user';
            req.user = data;
        } else if (role === 'service') {
            // Fetch service from the 'services' table
            const { data, error } = await supabase.from('services').select('*').eq('id', id).single();
            if (!data || error) {
                console.error('Error fetching service:', error);
                return res.status(401).json({ error: 'Service not found' });
            }
            req.authType = 'service';
            req.service = data;
        } else {
            console.error('Invalid role in token:', role);
            return res.status(403).json({ error: 'Invalid role in token' });
        }

        next();
    } catch (error) {
        console.error('JWT verification error:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = authenticate;
