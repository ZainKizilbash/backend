const express = require('express');
const supabase = require('../../supabaseClient');
require('dotenv').config();

const router = express.Router();

// Endpoint to add food details
router.post('/donation', async (req, res) => {
    const { donation_id, donor_id, org_id, status } = req.body;

    // Validate required fields
    if (!donation_id || !donor_id || !org_id || !status) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Insert food details into the "food" table
        const { data, error } = await supabase.from('donations').insert([
            {
                donation_id, 
                donor_id, 
                org_id, 
                status
            }
        ]);

        if (error) {
            throw error;
        }

        res.status(201).json({ message: 'Donations details added successfully', data });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add donation details', error: error.message });
    }
});

module.exports = router;
