const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../../supabaseClient');
require('dotenv').config();

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

// 🟢 Organization Registration
router.post('/register', async (req, res) => {
    const {
        name, email, password, registration_number, org_type,
        mission_statement, bank_details, scope, donation_types,
        tax_exempt, address
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !registration_number || !org_type || !address) {
        return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert organization into the database
    const { data, error } = await supabase.from('organizations').insert([{
        name,
        email,
        password: hashedPassword,
        registration_number,
        org_type,
        mission_statement,
        bank_details,
        scope,
        donation_types,
        tax_exempt,
        address
    }]);

    if (error) {
        return res.status(500).json({ message: 'Error registering organization', error });
    }

    res.status(201).json({ message: 'Organization registered successfully' });
});

// 🟢 Organization Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // Fetch organization by email
    const { data, error } = await supabase.from('organizations').select('*').eq('email', email).single();

    if (error || !data) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, data.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT Token
    const token = jwt.sign({ organization_id: data.organization_id, email: data.email }, SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
});

module.exports = router;