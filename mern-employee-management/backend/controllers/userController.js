const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// User login
const loginUser = async (req, res) => {
  const { userName, password } = req.body;
  const user = await User.findOne({ userName });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  res.json({ userName: user.userName, token });
};

module.exports = { loginUser };
