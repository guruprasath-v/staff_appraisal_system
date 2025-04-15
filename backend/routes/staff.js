const express = require("express");
const router = express.Router();
const { registerStaff } = require("../controllers/staffController");
const { auth, isAdmin } = require("../middlewares/auth");

// Protected routes (Admin only)
router.post("/", auth, isAdmin, registerStaff);

module.exports = router;
