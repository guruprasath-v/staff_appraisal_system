const express = require("express");
const router = express.Router();
const {
  createTask,
  getDptTasks,
} = require("../controllers/departmentController");
const {
  createSubtask,
  getSubtasks,
  updateSubtaskStatus,
} = require("../controllers/subtaskController");
const isHOD = require("../middlewares/isHOD");
const { auth } = require("../middlewares/auth");

// Protected routes for HODs

router.post("/tasks", auth, isHOD, createTask);
router.get("/tasks", auth, isHOD, getDptTasks);

// Subtask routes
router.post("/stask/:pid", auth, isHOD, createSubtask);
router.get("/stask", auth, isHOD, getSubtasks);
router.put("/stask/:stid", auth, isHOD, updateSubtaskStatus);

module.exports = router;
