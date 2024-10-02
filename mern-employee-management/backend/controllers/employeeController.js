const Employee = require("../models/Employee");

// Get all employees
const getEmployees = async (req, res) => {
  const employees = await Employee.find();
  res.json(employees);
};

// Create new employee
const createEmployee = async (req, res) => {
  const employee = new Employee(req.body);
  await employee.save();
  res.json(employee);
};

// Update employee
const updateEmployee = async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(employee);
};

// Delete employee
const deleteEmployee = async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.json({ message: "Employee deleted" });
};

module.exports = {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
