const express = require("express");
const router = express.Router();
const {
  createTask,
  getDptTasks,
  getDptReviewSubtasks,
  getDepartmentStaff,
  getTaskDetails,
} = require("../controllers/departmentController");
const {
  createSubtask,
  getSubtasks,
  updateSubtaskStatus,
  getSubtasksByParentTaskId,
} = require("../controllers/subtaskController");
const isHOD = require("../middlewares/isHOD");
const { auth } = require("../middlewares/auth");

// Protected routes for HODs

router.post("/tasks", auth, isHOD, createTask);
router.get("/tasks", auth, isHOD, getDptTasks);
router.get("/tasks/:id", auth, isHOD, getTaskDetails);

// Subtask routes
router.post("/stask/:pid", auth, isHOD, createSubtask);
router.get("/stask", auth, isHOD, getSubtasks);
router.put("/stask/:stid", auth, isHOD, updateSubtaskStatus);
router.get("/stask/review", auth, isHOD, getDptReviewSubtasks);
router.get("/stask/:ptid", auth, isHOD, getSubtasksByParentTaskId);

// Get department staff with pending tasks
router.get("/staff/tasks", auth, isHOD, getDepartmentStaff);

module.exports = router;
