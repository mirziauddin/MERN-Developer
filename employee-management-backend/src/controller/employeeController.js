const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const path = require("path");

const prisma = new PrismaClient();

// Validation schema
const employeeSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  mobile: Joi.string()
    .pattern(/^[0-9]+$/)
    .length(10)
    .required(), // Assuming a 10-digit mobile number
  designation: Joi.string().required(),
  gender: Joi.string().valid("Male", "Female", "Other").required(),
  course: Joi.string().required(),
  userId: Joi.string().required(),
});

// Create employee
const createEmployee = async (req, res) => {
  // Validate request body
  const { error } = employeeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // Validate image upload
  const imageUrl = req.file ? req.file.path : null;
  if (req.file) {
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    if (!allowedExtensions.includes(fileExtension)) {
      return res
        .status(400)
        .json({ error: "Only jpg and png files are allowed." });
    }
  }

  // Check for duplicate email
  const existingEmployee = await prisma.employee.findUnique({
    where: { email: req.body.email },
  });
  if (existingEmployee) {
    return res.status(400).json({ error: "Email already exists." });
  }

  try {
    const employee = await prisma.employee.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        designation: req.body.designation,
        gender: req.body.gender,
        course: [req.body.course], // Wrap it in an array
        imageUrl,
        userId: req.body.userId,
      },
    });

    res.status(201).json(employee);
  } catch (error) {
    console.error("Error creating employee:", error); // Log for debugging
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found." });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  // Validate request body
  const { error } = employeeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // Validate image upload
  const imageUrl = req.file ? req.file.path : req.body.imageUrl; // Use existing image URL if no new file is uploaded
  if (req.file) {
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    if (!allowedExtensions.includes(fileExtension)) {
      return res
        .status(400)
        .json({ error: "Only jpg and png files are allowed." });
    }
  }

  try {
    const { id } = req.params;

    // Check for duplicate email
    const existingEmployee = await prisma.employee.findUnique({
      where: { email: req.body.email },
    });

    // If an employee exists with a different ID, return an error
    if (existingEmployee && existingEmployee.id !== id) {
      return res.status(400).json({ error: "Email already exists." });
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        designation: req.body.designation,
        gender: req.body.gender,
        course: [req.body.course],
        imageUrl,
      },
    });

    res.json(updatedEmployee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Export the functions
module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById, // Export the new function
  updateEmployee,
};
