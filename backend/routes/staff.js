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
const isHOD = require("../middlewares/isHOD");

// Protected routes (Admin only for rankings, HOD for user creation)
router.post("/", auth, isHOD, registerStaff);
router.get("/rankings", auth, isAdmin, getRankings);

// Protected routes (Staff only)
router.get("/stask", auth, isStaff, getAssignedSubtasks);
router.put("/stask/:stid", auth, isStaff, updateSubtaskStatus);

module.exports = router;
