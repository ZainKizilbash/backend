const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors()); // Allow cross-origin requests

// Import Routes
const donorAuthRoutes = require('./routes/donor/auth');
const organizationAuthRoutes = require('./routes/organization/auth');
// const adminRoutes = require('./routes/admin/auth');

// Use Routes
app.use('/api/donor', donorAuthRoutes); // Corrected route structure
app.use('/api/organization', organizationAuthRoutes);
// app.use('/api/admin', adminRoutes);

// Default Route
app.get('/', (req, res) => {
    res.send('Welcome to the GiveNTake API');
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
