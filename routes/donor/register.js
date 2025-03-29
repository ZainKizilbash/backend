const express = require("express");
const bcrypt = require("bcryptjs");
const supabase = require("../../supabaseClient");
require("dotenv").config();

const router = express.Router();

router.post("/register", async (req, res) => {
  let { phone, cnic_no, email, password, fname, lname, location } = req.body;

  console.log("Received donor registration request:", req.body);

  // Validate required fields
  const missingFields = [];
  if (!phone) missingFields.push("phone");
  if (!cnic_no) missingFields.push("cnic_no");
  if (!email) missingFields.push("email");
  if (!password) missingFields.push("password");
  if (!fname) missingFields.push("fname");
  if (!lname) missingFields.push("lname");

  if (missingFields.length > 0) {
    console.error(
      "Validation error: Missing fields:",
      missingFields.join(", ")
    );
    return res.status(400).json({
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  try {
    console.log("Checking if email exists:", email);

    // Check if the email already exists
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (userError) {
      console.error("Database error while checking email:", userError.message);
      return res.status(500).json({
        message: "Database error",
        error: userError.message,
      });
    }

    if (existingUser) {
      console.warn("Email already registered:", email);
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash the password
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 1: Insert into `users` table first
    console.log("Inserting into users table...");
    const { data: userData, error: userInsertError } = await supabase
      .from("users")
      .insert([
        {
          email,
          password: hashedPassword,
          phone,
          full_name: `${fname} ${lname}`,
          user_type: "donor", // Only donor is allowed
        },
      ])
      .select("id") // Get the inserted user's ID
      .single();

    if (userInsertError) throw userInsertError;
    console.log("User inserted successfully:", userData);

    const userId = userData.id; // This is the foreign key reference

    // Step 2: Insert into `donor` table using `user_id`
    console.log("Inserting into donor table...");
    const { error: donorInsertError } = await supabase.from("donor").insert([
      {
        user_id: userId, // Reference `users.id`
        phone,
        cnic_no,
        fname,
        lname,
        location,
      },
    ]);

    if (donorInsertError) throw donorInsertError;
    console.log(`Donor entry created successfully for user ${email}`);

    res.status(201).json({ message: "Donor registered successfully" });
  } catch (error) {
    console.error("Registration failed:", error.message);
    return res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
});

module.exports = router;
