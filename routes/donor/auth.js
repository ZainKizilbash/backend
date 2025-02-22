const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../../supabaseClient');
require('dotenv').config();

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET;

// 🟢 Donor Registration
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert donor into the database
    const { data, error } = await supabase.from('donors').insert([{ name, email, password: hashedPassword }]);

    if (error) {
        return res.status(500).json({ message: 'Error registering donor', error });
    }

    res.status(201).json({ message: 'Donor registered successfully' });
});

// 🟢 Donor Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // Fetch donor by email
    const { data, error } = await supabase.from('donors').select('*').eq('email', email).single();

    if (error || !data) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, data.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT Token
    const token = jwt.sign({ donor_id: data.donor_id, email: data.email }, SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
});


module.exports = router;
