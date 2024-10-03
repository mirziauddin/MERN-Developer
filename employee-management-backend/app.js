const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Initialize PrismaClient
const prisma = new PrismaClient();

// Middlewares
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require("./src/routes/authRoutes"); // Adjust the path if necessary
const employeeRoutes = require("./src/routes/employeeRoutes"); // Adjust the path if necessary

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

// Export the app
module.exports = app;
