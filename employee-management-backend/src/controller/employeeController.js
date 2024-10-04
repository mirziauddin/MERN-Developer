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
  designation: Joi.string().valid("HR", "Manager", "Sales").required(), // Match the enum in Prisma
  gender: Joi.string().valid("M", "F").required(), // Match the enum in Prisma (M/F)
  course: Joi.array().items(Joi.string().valid("MCA", "BCA", "BSC")).required(), // Array of enum values
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
        designation: req.body.designation, // Ensure this comes from the enum (HR/Manager/Sales)
        gender: req.body.gender, // Ensure this comes from the enum (M/F)
        course: Array.isArray(req.body.course)
          ? req.body.course
          : [req.body.course], // Ensure it's an array of courses (MCA/BCA/BSC)
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
// Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        designation: true, // Enum Designation
        gender: true, // Enum Gender
        course: true, // Enum array Course[]
        imageUrl: true,
        createdAt: true,
        active: true,
        userId: true,
      },
    });
    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
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
        designation: req.body.designation, // Ensure this is one of the Designation enum values
        gender: req.body.gender, // Ensure this is one of the Gender enum values
        course: req.body.course, // This should be an array of Course enum values4
        imageUrl,
      },
    });

    res.json(updatedEmployee);
  } catch (error) {
    console.error("Error updating employee data:", error);
    res.status(400).json({ error: error.message });
  }
};

// Delete employee by ID
const deleteEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return res.status(404).json({ error: "Employee not found." });
    }

    // Delete the employee
    await prisma.employee.delete({
      where: { id },
    });

    res.status(204).send(); // No content response
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateActiveStatus = async (req, res) => {
  const { id } = req.params; // Get the employee ID from request parameters
  const { active } = req.body; // Get the active status from request body

  // Validate the input
  if (!["Active", "Deactive"].includes(active)) {
    return res.status(400).json({
      error: 'Invalid active status. Must be "Active" or "Deactive".',
    });
  }

  try {
    // Update the employee's active status
    const updatedEmployee = await prisma.employee.update({
      where: { id: id }, // Find employee by ID
      data: { active }, // Update the active status
    });

    // Return the updated employee
    return res.json(updatedEmployee);
  } catch (error) {
    console.error("Error updating active status:", error);
    return res.status(500).json({ error: "Unable to update active status." });
  }
};

// Route setup

// Export the functions
module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById, // Export the new function
  updateEmployee,
  deleteEmployeeById,
  updateActiveStatus,
};
