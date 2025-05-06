const db = require("../configs/db");
const { v4: uuidv4 } = require("uuid");

class Task {
  static async getTaskDueDate(taskId) {
    const query = `
      SELECT duedate
      FROM tasks
      WHERE id = ?
    `;
    const [[task]] = await db.query(query, [taskId]);
    return task ? task.duedate : null;
  }

  static async create({ name, description, due_date, department_id }) {
    const id = uuidv4();
    const query = `
      INSERT INTO tasks (id, name, description, duedate, department_id)
      VALUES (?, ?, ?, ?, ?)
    `;

    await db.query(query, [id, name, description, due_date, department_id]);
    return { id, name, description, due_date, department_id };
  }

  static async findByDepartmentId(department_id, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        id,
        name,
        description,
        duedate,
        created_at,
        status,
        sub_task_count,
        pending_subtasks_count
      FROM tasks
      WHERE department_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total FROM tasks WHERE department_id = ?
    `;

    const [tasks] = await db.query(query, [department_id, limit, offset]);
    const [[{ total }]] = await db.query(countQuery, [department_id]);

    return {
      tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async updateSubTaskCount(taskId, increment = 1) {
    const query = `UPDATE tasks SET sub_task_count = sub_task_count + ? WHERE id = ?`;
    await db.query(query, [increment, taskId]);
  }

  static async updatePendingSubtasksCount(taskId, increment = 1) {
    const query = `UPDATE tasks SET pending_subtasks_count = pending_subtasks_count + ? WHERE id = ?`;
    await db.query(query, [increment, taskId]);
  }

  static async findById(taskId) {
    const query = `
      SELECT 
        id,
        name,
        description,
        duedate as due_date,
        created_at,
        status,
        sub_task_count,
        pending_subtasks_count,
        department_id
      FROM tasks
      WHERE id = ?
    `;
    const [[task]] = await db.query(query, [taskId]);
    return task;
  }
}

module.exports = Task;
