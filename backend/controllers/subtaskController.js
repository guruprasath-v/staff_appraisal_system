const Subtask = require("../models/subtaskModel");
const Task = require("../models/taskModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const { sendEmail } = require("../utils/emailService");

const { formatDateToMySQL } = require("../utils/dateUtils");
const {
  calculateEfficiency,
  calculateOverallEfficiency,
} = require("../utils/efficiencyUtils");

const createSubtask = async (req, res, next) => {
  try {
    const { name, description, priority, assigned_employees, due_date } = req.body;
    const { taskId } = req.params;

    // Validate required fields
    if (!name || !priority || !assigned_employees || !Array.isArray(assigned_employees) || assigned_employees.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, priority, and at least one assigned employee"
      });
    }

    // Create subtasks for each assigned employee
    const subtasks = [];
    for (const employeeId of assigned_employees) {
      const subtask = await Subtask.create({
        name,
        description,
        priority,
        status: 'pending',
        parent_task_id: taskId,
        assigned_employee: employeeId,
        due_date,
        department_id: req.user.department_id
      });

      // Update counts for the assigned employee
      await User.updatePendingCount(employeeId);

      // Send email notification to the assigned user
      const user = await User.findById(employeeId);
      if (user && user.email) {
        try {
          const task = await Task.findById(taskId);
          const taskName = task ? task.name : 'Unknown Task';
          await sendEmail(
            user.email,
            'subtaskAssigned',
            [name, taskName, due_date]
          );
        } catch (error) {
          console.error("Error sending email:", error);
        }
      }

      // Create in-app notification
      await Notification.create({
        userId: employeeId,
        message: `You have been assigned a new subtask: ${name}`,
        type: "task_assignment"
      });

      subtasks.push(subtask);
    }

    // Update parent task counts
    await Task.updateSubTaskCount(taskId);
    await Task.updatePendingSubtasksCount(taskId);

    res.status(201).json({
      success: true,
      message: "Subtasks created successfully",
      data: subtasks
    });
  } catch (error) {
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

const getSubtasksByParentTaskId = async (req, res, next) => {
  try {
    const { ptid } = req.params;
    const subtasks = await Subtask.findByParentTaskId(ptid);
    res.status(200).json({ success: true, data: subtasks });
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

    // Handle completion status
    const quality_of_work = req.body.quality_of_work;
    if (!quality_of_work) {
      return res.status(400).json({
        success: false,
        message: "Quality of work must be provided",
      });
    }

    // Validate quality of work value
    const validQualityRatings = [
      "excellent",
      "good",
      "satisfactory",
      "needs improvement",
    ];
    if (!validQualityRatings.includes(quality_of_work.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid quality of work rating. Must be one of: excellent, good, satisfactory, needs improvement",
      });
    }

    // Get necessary data for efficiency calculation
    const subtaskDetails = await Subtask.getSubtaskDetails(subtaskId);
    if (!subtaskDetails) {
      return res.status(404).json({
        success: false,
        message: "Subtask not found",
      });
    }

    const assigned_employee = subtaskDetails.assigned_employee;
    if (!assigned_employee) {
      return res.status(400).json({
        success: false,
        message: "No employee assigned to this subtask",
      });
    }

    const userMetrics = await User.getUserMetrics(assigned_employee);
    if (!userMetrics) {
      return res.status(404).json({
        success: false,
        message: "User metrics not found",
      });
    }

    // Calculate efficiency for this task
    const efficiency = calculateEfficiency({
      qualityOfWork: quality_of_work,
      createdDate: subtaskDetails.created_at,
      workload: userMetrics.workload || 0,
      pendingTasks: userMetrics.pending_count || 0,
      reworkCount: subtaskDetails.rework_count || 0,
      tasksCompletedCount: userMetrics.tasks_completed_count || 0,
    });

    // Validate efficiency calculation
    if (isNaN(efficiency) || efficiency < 0 || efficiency > 100) {
      return res.status(500).json({
        success: false,
        message: "Error calculating efficiency score",
      });
    }

    // Calculate new overall efficiency
    const newOverallEfficiency = calculateOverallEfficiency(
      efficiency,
      (userMetrics.tasks_completed_count || 0) + 1,
      userMetrics.overall_efficiency || 0
    );

    // Validate overall efficiency calculation
    if (
      isNaN(newOverallEfficiency) ||
      newOverallEfficiency < 0 ||
      newOverallEfficiency > 100
    ) {
      return res.status(500).json({
        success: false,
        message: "Error calculating overall efficiency score",
      });
    }

    await Task.updatePendingSubtasksCount(subtaskDetails.parent_task_id, -1);
    // Update subtask status and efficiency
    await Subtask.updateCompletionStatus(subtaskId, efficiency);

    // Update user metrics and overall efficiency
    await User.updateTaskCompletionMetrics(
      assigned_employee,
      newOverallEfficiency
    );

    // Create notification for assigned employee
    await Notification.create({
      userId: assigned_employee,
      message: `Your subtask status has been updated to: ${status}`,
      type: "subtask_status_updated"
    });

    return res.status(200).json({
      success: true,
      message: "Subtask completed successfully",
      data: {
        efficiency,
        overallEfficiency: newOverallEfficiency,
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
  getSubtasksByParentTaskId,
};
