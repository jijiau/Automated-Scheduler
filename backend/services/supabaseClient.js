require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Use environment variables for configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY; // Use the ANON KEY for client operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use the SERVICE ROLE KEY for backend server operations

// Ensure that the keys are present
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables.');
    process.exit(1); // Exit with an error if required variables are not set
}

// Create the Supabase client using the SERVICE_ROLE_KEY for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Export the Supabase client
module.exports = supabase;
