const db = require("../configs/db");
const { v4: uuidv4 } = require("uuid");

class Subtask {
  static async create({
    name,
    description,
    priority,
    parent_task_id,
    assigned_employee,
    due_date,
    department_id,
  }) {
    const id = uuidv4();
    const query = `
      INSERT INTO subtasks (
        id, 
        name, 
        description, 
        priority, 
        parent_task_id, 
        assigned_employee, 
        due_date, 
        department_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      id,
      name,
      description,
      priority,
      parent_task_id,
      assigned_employee,
      due_date,
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
      department_id,
    };
  }
}

module.exports = Subtask;
