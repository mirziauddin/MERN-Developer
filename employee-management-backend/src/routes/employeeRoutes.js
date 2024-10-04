const express = require("express");
const router = express.Router();
const upload = require("../services/upload");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  getEmployeeById,
  deleteEmployeeById,
  updateActiveStatus,
} = require("../controller/employeeController");

router.post("/", authMiddleware, upload.single("image"), createEmployee);
router.get("/", authMiddleware, getAllEmployees);
router.put("/:id", authMiddleware, upload.single("image"), updateEmployee);
router.get("/:id", authMiddleware, getEmployeeById);
router.delete("/:id", deleteEmployeeById);
router.patch("/:id/active", authMiddleware, updateActiveStatus);

module.exports = router;
