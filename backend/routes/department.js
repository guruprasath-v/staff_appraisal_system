const express = require("express");
const router = express.Router();
const {
  createTask,
  getHODTasks,
} = require("../controllers/departmentController");
const isHOD = require("../middlewares/isHOD");
const { auth } = require("../middlewares/auth");

// Protected routes for HODs

router.post("/tasks", auth, isHOD, createTask);
router.get("/tasks", auth, isHOD, getHODTasks);

module.exports = router;
// now we have to create subtasks because without subtasks tasks are nothing 
// this route would be api/department/tasks/{id} post method means create subtask and that would take

// id(uuid()), name, description, priority, parent_task_id(that {id}), assigned_employee