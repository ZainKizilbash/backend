const express = require('express');
const cors = require('cors');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors()); // Allow cross-origin requests

// Import Routes
const donorRegister = require('./routes/donor/register');
const foodForm = require('./routes/donor/food_donation');
const organizationRegister = require('./routes/organization/register');
const loginRoute = require('./routes/login');
const adminRoute = require('./routes/admin/register');
const getorg = require('./routes/organization/get_details');


// Use Routes
app.use('/api/donor', donorRegister);
app.use('/api/donor', foodForm);
app.use('/api/organization', organizationRegister);
app.use('/api/admin', adminRoute);
app.use('/api', loginRoute);
app.use('/api', getorg);





// Default Route
app.get('/', (req, res) => {
    res.send('This is GiveNTake API');
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
