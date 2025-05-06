const db = require("../configs/db");
const { v4: uuidv4 } = require("uuid");

class Subtask {
  static async getByStaffId(staffId) {
    const query = `
      SELECT st.*, t.name as task_name
      FROM sub_tasks st
      LEFT JOIN tasks t ON st.parent_task_id = t.id
      WHERE st.assigned_employee = ?
      ORDER BY st.created_at DESC
    `;
    const [subtasks] = await db.query(query, [staffId]);
    return subtasks;
  }

  static async updateReworkStatus(subtaskId) {
    const query = `
      UPDATE sub_tasks 
      SET rework_count = rework_count + 1, 
          status = 'rework'
      WHERE id = ?
    `;
    await db.query(query, [subtaskId]);
  }

  static async getSubtaskDetails(subtaskId) {
    const query = `
      SELECT created_at, rework_count, assigned_employee, status, parent_task_id
      FROM sub_tasks
      WHERE id = ?
    `;
    const [[subtask]] = await db.query(query, [subtaskId]);
    return subtask;
  }

  static async updateCompletionStatus(subtaskId, efficiency) {
    console.log(subtaskId, efficiency);
    const query = `
      UPDATE sub_tasks
      SET status = 'completed',
          efficiency = ?
      WHERE id = ?
    `;
    await db.query(query, [efficiency, subtaskId]);
  }

  static async updateToReviewStatus(subtaskId) {
    const query = `
      UPDATE sub_tasks
      SET status = 'review'
      WHERE id = ?
    `;
    await db.query(query, [subtaskId]);
  }

  static async create({
    name,
    description,
    priority,
    parent_task_id,
    assigned_employee,
    due_date,
    max_due_date,
    department_id,
  }) {
    const id = uuidv4();
    const query = `
      INSERT INTO sub_tasks (
        id, 
        name, 
        description, 
        priority, 
        parent_task_id, 
        assigned_employee, 
        due_date,
        max_due_date,
        department_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      id,
      name,
      description,
      priority,
      parent_task_id,
      assigned_employee,
      due_date,
      max_due_date,
      department_id,
    ]);

    return {
      id,
      name,
      description,
      priority,
      parent_task_id,
      assigned_employee,
      due_date,
      max_due_date,
      department_id,
    };
  }

  static async findByDepartmentId(department_id, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        s.*,
        t.name as task_name,
        u.name as employee_name,
        u.email as employee_email
      FROM sub_tasks s
      LEFT JOIN tasks t ON s.parent_task_id = t.id
      LEFT JOIN users u ON s.assigned_employee = u.id
      WHERE s.department_id = ?
      ORDER BY s.due_date
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total FROM sub_tasks WHERE department_id = ?
    `;

    const [subtasks] = await db.query(query, [department_id, limit, offset]);
    const [[{ total }]] = await db.query(countQuery, [department_id]);

    return {
      subtasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async findByParentTaskId(parent_task_id) {
    const query = `
      SELECT s.*, t.name as task_name, u.name as employee_name, u.email as employee_email
      FROM sub_tasks s
      LEFT JOIN tasks t ON s.parent_task_id = t.id
      LEFT JOIN users u ON s.assigned_employee = u.id
      WHERE s.parent_task_id = ?
      ORDER BY s.updated_at ASC
    `;
    const [subtasks] = await db.query(query, [parent_task_id]);
    return subtasks;
  }
}

module.exports = Subtask;
