const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const login = async (req, res) => {
  try {
    const { userName, password } = req.body;

    // Check if the user exists
    const user = await prisma.user.findUnique({ where: { userName } });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Return token and user info
    res.status(200).json({ token, userId: user.id, userName: user.userName });
  } catch (error) {
    console.error("Login error:", error); // Log the error for debugging
    res.status(500).json({ message: "Internal server error" });
  }
};

const register = async (req, res) => {
  try {
    const { userName, password } = req.body;

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { userName },
    });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        userName,
        password: hashedPassword,
      },
    });

    // Optionally, you can generate a JWT token after registration
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Return success response
    res.status(201).json({ token, userId: user.id, userName: user.userName });
  } catch (error) {
    console.error("Registration error:", error); // Log the error for debugging
    res.status(500).json({ message: "Internal server error" });
  }
};

// Export the functions
module.exports = {
  login,
  register,
};
