const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../../supabaseClient');
require('dotenv').config();

const router = express.Router();

router.post('/register', async (req, res) => {
    const { phone, cnic_no, email, password } = req.body;

    if (!phone || !cnic_no || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the email already exists in the role table
    const { data: existingUser, error: userError } = await supabase
        .from('role')
        .select('id')
        .eq('email', email)
        .maybeSingle();

    if (userError) {
        return res.status(500).json({ message: 'Database error', error: userError });
    }

    if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start a transaction (Simulating since Supabase doesn't support actual transactions)
    try {
        // Insert into `donor` table
        const { data: donorData, error: donorError } = await supabase
            .from('donor')
            .insert([{ phone, cnic_no }])
            .select('id')
            .maybeSingle();

        if (donorError) throw donorError;

        // Insert into `role` table
        const { error: roleError } = await supabase.from('role').insert([
            {
                email,
                password: hashedPassword,
                role: 'donor'
            }
        ]);

        if (roleError) throw roleError;

        res.status(201).json({ message: 'Donor registered successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Registration failed', error });
    }
});

module.exports = router;
