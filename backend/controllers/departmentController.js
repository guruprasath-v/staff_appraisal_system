const Task = require("../models/taskModel");
const { formatDateToMySQL } = require("../utils/dateUtils");
const Subtask = require("../models/subtaskModel");
const User = require("../models/userModel");
const db = require("../db");

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
    const department_id = req.user.department_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await Task.findByDepartmentId(department_id, page, limit);

    res.status(200).json({
      success: true,
      message: "Tasks retrieved successfully",
      data: result.tasks,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getTaskDetails = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const department_id = req.user.department_id;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Verify that the task belongs to the HOD's department
    if (task.department_id !== department_id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this task",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task details retrieved successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const getDptReviewSubtasks = async (req, res, next) => {
  try {
    // Get and validate pagination parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const department_id = req.user.department_id;

    // Query to get subtasks with review status
    const query = `
      SELECT st.*, t.name as task_name
      FROM sub_tasks st
      LEFT JOIN tasks t ON st.parent_task_id = t.id
      WHERE st.department_id = ? AND st.status = 'review'
      ORDER BY st.updated_at ASC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM sub_tasks
      WHERE department_id = ? AND status = 'review'
    `;

    const [[{ total }]] = await db.query(countQuery, [department_id]);
    const [subtasks] = await db.query(query, [
      department_id,
      limit,
      (page - 1) * limit,
    ]);

    res.status(200).json({
      success: true,
      data: subtasks,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDepartmentStaff = async (req, res, next) => {
  try {
    const departmentId = req.user.department_id;

    // Get all staff members in the department with their pending tasks
    const query = `
      SELECT u.id, u.name, u.email,
      COUNT(CASE WHEN st.status NOT IN ('completed', 'rejected') THEN 1 END) as pending_tasks
      FROM users u
      LEFT JOIN sub_tasks st ON u.id = st.assigned_employee
      WHERE u.dpt = ? AND u.role = 'staff'
      GROUP BY u.dpt, u.name, u.email
      ORDER BY u.name ASC
    `;

    const [staffMembers] = await db.query(query, [departmentId]);
    res.status(200).json({
      success: true,
      data: staffMembers,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getDptTasks,
  getDptReviewSubtasks,
  getDepartmentStaff,
  getTaskDetails,
};
