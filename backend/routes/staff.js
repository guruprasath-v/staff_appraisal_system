const express = require("express");
const router = express.Router();
const {
  registerStaff,
  getAssignedSubtasks,
  updateSubtaskStatus,
  getRankings,
} = require("../controllers/staffController");
const { auth, isAdmin } = require("../middlewares/auth");
const { isStaff } = require("../middlewares/isStaff");

// Protected routes (Admin only)
router.post("/", auth, isAdmin, registerStaff);
router.get("/rankings", auth, isAdmin, getRankings);

// Protected routes (Staff only)
router.get("/stask", auth, isStaff, getAssignedSubtasks);
router.put("/stask/:stid", auth, isStaff, updateSubtaskStatus);

module.exports = router;
