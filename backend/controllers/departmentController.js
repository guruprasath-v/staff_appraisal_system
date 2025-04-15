const Task = require("../models/taskModel");

const createTask = async (req, res, next) => {
  try {
    const { name, description, due_date, department_id } = req.body;

    // Validate required fields
    if (!name || !description || !due_date || !department_id) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: name, description, due_date, department_id",
      });
    }

    // Create new task
    const task = await Task.create({
      name,
      description,
      due_date,
      department_id,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const getHODTasks = async (req, res, next) => {
  try {
    // Get tasks for the HOD's department, ordered by due date
    const tasks = await Task.findByHODId(req.user.id);

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getHODTasks,
};
