const Task = require("../models/taskModel");
const { formatDateToMySQL } = require("../utils/dateUtils");

const createTask = async (req, res, next) => {
  try {
    const { name, description, due_date } = req.body;
    const department_id = req.user.department_id; // Get department_id from JWT token

    // Validate required fields
    if (!name || !description || !due_date) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: name, description, due_date",
      });
    }

    // Format the due date to MySQL timestamp
    const formattedDueDate = formatDateToMySQL(due_date);

    // Create new task
    const task = await Task.create({
      name,
      description,
      due_date: formattedDueDate,
      department_id,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    if (error.message.includes("Date conversion error")) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Please provide a valid date",
      });
    }
    next(error);
  }
};

const getDptTasks = async (req, res, next) => {
  try {
    // Get and validate pagination parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

    // Get tasks for the HOD's department with pagination
    const result = await Task.findByDepartmentId(
      req.user.department_id,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      data: result.tasks,
      pagination: {
        ...result.pagination,
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getDptTasks,
};
