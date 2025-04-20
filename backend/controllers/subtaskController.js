const Subtask = require("../models/subtaskModel");
const { formatDateToMySQL } = require("../utils/dateUtils");

const createSubtask = async (req, res, next) => {
  try {
    const { name, description, priority, assigned_employee, due_date } =
      req.body;
    const parent_task_id = req.params.pid; // Get parent task ID from route parameter
    const department_id = req.user.department_id; // Get department ID from JWT token

    // Validate required fields
    if (!name || !description || !priority || !assigned_employee || !due_date) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: name, description, priority, assigned_employee, due_date",
      });
    }

    // Format the due date
    const formattedDueDate = formatDateToMySQL(due_date);

    // Create new subtask
    const subtask = await Subtask.create({
      name,
      description,
      priority,
      parent_task_id,
      assigned_employee,
      due_date: formattedDueDate,
      department_id,
    });

    res.status(201).json({
      success: true,
      message: "Subtask created successfully",
      data: subtask,
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

module.exports = {
  createSubtask,
};
