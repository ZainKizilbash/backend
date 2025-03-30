const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors()); // Allow cross-origin requests

// Import Routes
const donorRegister = require("./routes/donor/register");
const foodForm = require("./routes/donor/food_donation");
const organizationRegister = require("./routes/organization/register");
const loginRoute = require("./routes/login");
const adminRoute = require("./routes/admin/register");
const getorg = require("./routes/organization/get_details");

// Use Routes
app.use("/api/donor", donorRegister);
app.use("/api/donor", foodForm);
app.use("/api/organization", organizationRegister);
app.use("/api/admin", adminRoute);
app.use("/api", loginRoute);
app.use("/api", getorg);

// Default Route
app.get("/", (req, res) => {
  const { error, error_code, error_description } = req.query;

  if (error) {
    return res.send(`
        <html>
        <head><title>Error</title></head>
        <body>
          <h2>Signup Error</h2>
          <p><strong>Error:</strong> ${error}</p>
          <p><strong>Code:</strong> ${error_code}</p>
          <p><strong>Description:</strong> ${decodeURIComponent(
            error_description
          )}</p>
          <p>Please try signing up again.</p>
          <a href="/signup">Go to Signup</a>
        </body>
        </html>
      `);
  }

  res.sendFile(path.join(__dirname, "/index.html"));
});
// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
