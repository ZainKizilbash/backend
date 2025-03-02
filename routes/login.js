const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../supabaseClient');
require('dotenv').config();

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // Fetch user from the role table
    const { data: user, error } = await supabase
        .from('role')
        .select('id, email, role, password')
        .eq('email', email)
        .maybeSingle();

    if (error || !user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    let userData = { id: user.id, email: user.email, role: user.role };

    try {
        if (user.role === 'donor') {
            // Fetch donor details
            const { data: donorData } = await supabase
                .from('donor')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();
            if (donorData) userData = { ...userData, ...donorData };
        }
        else if (user.role === 'organization') {
            // Fetch organization details
            const { data: orgData } = await supabase
                .from('organisation')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();
            if (orgData) userData = { ...userData, ...orgData };
        }
        else if (user.role === 'admin') {
            // Fetch admin details
            const { data: adminData } = await supabase
                .from('admin')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();
            if (adminData) userData = { ...userData, ...adminData };
        }

        // Remove password field before sending response
        delete userData.password;

        // Generate JWT Token
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login successful',
            user: userData,
            token
        });
    } catch (fetchError) {
        console.error('Error fetching user details:', fetchError);
        return res.status(500).json({ message: 'Error fetching user details', error: fetchError });
    }
});

module.exports = router;
