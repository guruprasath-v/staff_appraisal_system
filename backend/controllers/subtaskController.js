const Subtask = require("../models/subtaskModel");
const Task = require("../models/taskModel");
const User = require("../models/userModel");

const { formatDateToMySQL } = require("../utils/dateUtils");
const {
  calculateEfficiency,
  calculateOverallEfficiency,
} = require("../utils/efficiencyUtils");

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

    // Get parent task's due date
    const parentTaskDueDate = await Task.getTaskDueDate(parent_task_id);
    if (!parentTaskDueDate) {
      return res.status(404).json({
        success: false,
        message: "Parent task not found",
      });
    }

    // Format the due dates
    const formattedDueDate = formatDateToMySQL(due_date);
    const formattedMaxDueDate = formatDateToMySQL(parentTaskDueDate);

    // Validate subtask due date against parent task due date
    if (new Date(formattedDueDate) > new Date(formattedMaxDueDate)) {
      return res.status(400).json({
        success: false,
        message: "Subtask due date cannot be later than parent task due date",
      });
    }

    // Create new subtask
    const subtask = await Subtask.create({
      name,
      description,
      priority,
      parent_task_id,
      assigned_employee,
      due_date: formattedDueDate,
      max_due_date: formattedMaxDueDate,
      department_id,
    });

    // Update pending_count for assigned employee
    await User.updatePendingCount(assigned_employee);

    // Update sub_task_count and pending_subtasks_count for parent task
    await Task.updateSubTaskCount(parent_task_id);
    await Task.updatePendingSubtasksCount(parent_task_id);

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

const getSubtasks = async (req, res, next) => {
  try {
    const department_id = req.user.department_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await Subtask.findByDepartmentId(department_id, page, limit);

    res.status(200).json({
      success: true,
      message: "Subtasks retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateSubtaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const subtaskId = req.params.stid;

    if (!["rework", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Only 'rework' or 'completed' are supported",
      });
    }

    if (status === "rework") {
      await Subtask.updateReworkStatus(subtaskId);
      return res.status(200).json({
        success: true,
        message: "Subtask status updated to rework successfully",
      });
    }
    const quality_of_work = req.body.quality_of_work;
    // Handle completion status
    if (!quality_of_work || quality_of_work < 1 || quality_of_work > 10) {
      return res.status(400).json({
        success: false,
        message: "Quality of work must be provided and be between 1 and 10",
      });
    }

    // Get necessary data for efficiency calculation
    const subtaskDetails = await Subtask.getSubtaskDetails(subtaskId);
    console.log(subtaskDetails.assigned_employee);
    const assigned_employee = subtaskDetails.assigned_employee;

    const userMetrics = await User.getUserMetrics(assigned_employee);

    // Calculate efficiency for this task
    const efficiency = calculateEfficiency({
      qualityOfWork: quality_of_work,
      createdDate: subtaskDetails.created_at,
      workload: userMetrics.workload,
      pendingTasks: userMetrics.pending_count,
      reworkCount: subtaskDetails.rework_count,
    });

    // Calculate new overall efficiency
    const newOverallEfficiency = calculateOverallEfficiency(
      efficiency,
      userMetrics.tasks_completed_count + 1,
      userMetrics.overall_efficiency
    );

    console.log(newOverallEfficiency);

    // Update subtask status and efficiency
    await Subtask.updateCompletionStatus(subtaskId, efficiency);

    // Update user metrics and overall efficiency
    await User.updateTaskCompletionMetrics(
      assigned_employee,
      newOverallEfficiency
    );

    // Update task's pending subtasks count
    await Task.updatePendingSubtasksCount(subtaskId, -1);

    res.status(200).json({
      success: true,
      message: "Subtask marked as completed successfully",
      data: {
        efficiency,
        overall_efficiency: newOverallEfficiency,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubtask,
  getSubtasks,
  updateSubtaskStatus,
};
