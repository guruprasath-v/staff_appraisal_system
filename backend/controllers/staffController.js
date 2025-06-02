const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Subtask = require("../models/subtaskModel");
const Notification = require("../models/notificationModel");
const db = require("../db");

const getRankings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const rankings = await User.getRankings(page, limit);

    res.status(200).json({
      success: true,
      data: rankings,
    });
  } catch (error) {
    next(error);
  }
};

const registerStaff = async (req, res, next) => {
  try {
    const { name, email, mob, password, role, dpt, workload } = req.body;

    // Validate required fields
    if (!name || !email || !password || !dpt) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, password, and department",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create staff user
    const user = await User.createUser({
      name,
      email,
      mob: mob || "",
      password: hashedPassword,
      role: role || "staff",
      dpt,
      workload: workload || 0,
    });

    if (!user || !user.id) {
      throw new Error("Failed to create user");
    }

    // Create notification for new staff
    await Notification.create({
      userId: user.id,
      message: `Welcome to the Staff Appraisal System! Your account has been created.`,
      type: "welcome"
    });

    res.status(201).json({
      success: true,
      message: "Staff registered successfully",
      data: {
        id: user.id,
        name,
        email,
        role: role || "staff",
        department_id: dpt
      }
    });
  } catch (error) {
    console.error("Error in registerStaff:", error);
    next(error);
  }
};

const getAssignedSubtasks = async (req, res, next) => {
  try {
    const staffId = req.user.id;
    const subtasks = await Subtask.getByStaffId(staffId);

    res.status(200).json({
      success: true,
      data: subtasks,
    });
  } catch (error) {
    next(error);
  }
};

const updateSubtaskStatus = async (req, res, next) => {
  try {
    const { stid } = req.params;
    await Subtask.updateToReviewStatus(stid);

    res.status(200).json({
      success: true,
      message: "Subtask status updated to review",
    });
  } catch (error) {
    next(error);
  }
};

const generateStaffReport = async (req, res, next) => {
  try {
    const { staffId } = req.params;

    // Get staff details
    const staffDetails = await User.findById(staffId);
    if (!staffDetails) {
      return res.status(404).json({
        success: false,
        message: "Staff not found"
      });
    }

    // Get all tasks and subtasks assigned to the staff
    const query = `
      SELECT 
        t.id as task_id,
        t.name as task_name,
        t.description as task_description,
        t.duedate as task_due_date,
        t.status as task_status,
        st.id as subtask_id,
        st.name as subtask_name,
        st.description as subtask_description,
        st.priority as subtask_priority,
        st.due_date as subtask_due_date,
        st.status as subtask_status,
        st.efficiency as subtask_efficiency,
        st.rework_count as subtask_rework_count,
        st.created_at as subtask_created_at,
        st.updated_at as subtask_updated_at
      FROM tasks t
      LEFT JOIN sub_tasks st ON t.id = st.parent_task_id
      WHERE st.assigned_employee = ?
      ORDER BY st.created_at DESC
    `;

    const [tasks] = await db.query(query, [staffId]);

    // Calculate performance metrics
    const totalSubtasks = tasks.length;
    const completedSubtasks = tasks.filter(t => t.subtask_status === 'completed').length;
    const inProgressSubtasks = tasks.filter(t => t.subtask_status === 'in progress').length;
    const pendingSubtasks = tasks.filter(t => t.subtask_status === 'pending').length;
    const reworkSubtasks = tasks.filter(t => t.subtask_rework_count > 0).length;

    // Calculate average efficiency
    const completedSubtasksWithEfficiency = tasks.filter(t => t.subtask_efficiency !== null);
    const averageEfficiency = completedSubtasksWithEfficiency.length > 0
      ? completedSubtasksWithEfficiency.reduce((acc, curr) => acc + curr.subtask_efficiency, 0) / completedSubtasksWithEfficiency.length
      : 0;

    // Get staff's overall efficiency
    const staffMetrics = await User.getUserMetrics(staffId);

    const report = {
      staffDetails: {
        id: staffDetails.id,
        name: staffDetails.name,
        email: staffDetails.email,
        role: staffDetails.role,
        department: staffDetails.department_id,
        overallEfficiency: staffMetrics.overall_efficiency || 0,
        workload: staffMetrics.workload || 0
      },
      performanceMetrics: {
        totalSubtasks,
        completedSubtasks,
        inProgressSubtasks,
        pendingSubtasks,
        reworkSubtasks,
        averageEfficiency: Math.round(averageEfficiency * 100) / 100,
        completionRate: totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0
      },
      taskHistory: tasks.map(task => ({
        taskId: task.task_id,
        taskName: task.task_name,
        subtaskId: task.subtask_id,
        subtaskName: task.subtask_name,
        priority: task.subtask_priority,
        status: task.subtask_status,
        efficiency: task.subtask_efficiency,
        reworkCount: task.subtask_rework_count,
        dueDate: task.subtask_due_date,
        createdAt: task.subtask_created_at,
        updatedAt: task.subtask_updated_at
      }))
    };

    res.status(200).json({
      success: true,
      message: "Staff report generated successfully",
      data: report
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerStaff,
  getAssignedSubtasks,
  updateSubtaskStatus,
  getRankings,
  generateStaffReport
};
