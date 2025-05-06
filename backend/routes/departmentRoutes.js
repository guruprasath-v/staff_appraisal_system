// Get all tasks for the department
router.get("/tasks", authenticateToken, getDptTasks);

// Get task details
router.get("/tasks/:id", authenticateToken, getTaskDetails);
