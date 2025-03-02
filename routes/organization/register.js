const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../../supabaseClient');
require('dotenv').config();

const router = express.Router();

router.post('/register', async (req, res) => {
    const {
        email, password, name, license_no, type,
        mission_statement, mission_scope, donations_accepted,
        phone, registration_document
    } = req.body;

    // Validate required fields
    if (!email || !password || !name || !license_no || !phone) {
        return res.status(400).json({ message: 'Required fields are missing' });
    }

    try {
        // Check if email already exists
        const { data: existingUser, error: userError } = await supabase
            .from('role')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (userError) throw userError;
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Check if license number already exists
        const { data: existingOrg, error: orgError } = await supabase
            .from('organisation')
            .select('id')
            .eq('license_no', license_no)
            .maybeSingle();

        if (orgError) throw orgError;
        if (existingOrg) {
            return res.status(400).json({ message: 'License number already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into `role` table
        const { data: roleData, error: roleError } = await supabase
            .from('role')
            .insert([{ email, password: hashedPassword, role: 'organization' }])
            .select('id')
            .maybeSingle();

        if (roleError) throw roleError;

        // Insert into `organisation` table
        const { error: orgInsertError } = await supabase.from('organisation').insert([{
            id: roleData.id, // Use the same ID as the role table
            name: name,
            license_no,
            type,
            mission_statement,
            mission_scope,
            donations_accepted,
            phone,
            registration_document: registration_document || null, // Optional field
            status: 'pending' // Default status until admin approval
        }]);

        if (orgInsertError) throw orgInsertError;

        res.status(201).json({ message: 'Organization registered successfully' });
    } catch (error) {
        console.error('Registration Error:', error);
        return res.status(500).json({ message: 'Registration failed', error });
    }
});

module.exports = router;
