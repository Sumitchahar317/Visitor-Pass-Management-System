const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcrypt");

// Load server environment configurations
dotenv.config({ path: path.join(__dirname, ".env") });

const userModel = require("./model/userModel");

const seedAdmin = async () => {
  const dbUrl = process.env.URL;
  if (!dbUrl) {
    console.error("Error: URL environment variable is not defined in .env file.");
    process.exit(1);
  }

  try {
    console.log("Connecting to the database...");
    await mongoose.connect(dbUrl);
    console.log("Connected to MongoDB successfully.");

    const adminEmail = "admi1@gmail.com";
    
    // Check if the admin already exists
    const existingAdmin = await userModel.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`Admin account for ${adminEmail} already exists. Resetting/syncing password to "Admin@121"...`);
      
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash("Admin@121", salt);
      
      existingAdmin.password = hash;
      existingAdmin.role = "admin"; // Ensure the role remains admin
      existingAdmin.name = "admin1"; // Ensure the name remains admin1
      await existingAdmin.save();
      
      console.log("Success! Admin password synced successfully.");
    } else {
      console.log("Creating default admin account...");
      const admin = await userModel.signUp("admin1", adminEmail, "Admin@121", "admin");
      console.log(`Success! Created Admin user: ${admin.email}`);
    }

  } catch (err) {
    console.error("Database seeding encountered an error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
    process.exit(0);
  }
};

seedAdmin();
