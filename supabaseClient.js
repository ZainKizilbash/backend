const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase project details
const SUPABASE_URL = 'https://ydosdznpgkckwdqsclog.supabase.co';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkb3Nkem5wZ2tja3dkcXNjbG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMjAyMTAsImV4cCI6MjA1NTc5NjIxMH0.-UGJcZauiIqk5ghqEgDk1KFEx7DPfGp0t25uiAS0zmw';

const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

module.exports = supabase;
