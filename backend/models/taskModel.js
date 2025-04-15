const db = require("../configs/db");
const { v4: uuidv4 } = require("uuid");

class Task {
  static async create({ name, description, due_date, department_id }) {
    const id = uuidv4();
    const query = `
      INSERT INTO tasks (id, name, description, due_date, department_id)
      VALUES (?, ?, ?, ?, ?)
    `;

    await db.query(query, [id, name, description, due_date, department_id]);
    return { id, name, description, due_date, department_id };
  }

  static async findByHODId(hodId) {
    const query = `
      SELECT * FROM tasks 
      WHERE hod_id = ? 
      ORDER BY due_date ASC
    `;

    const [tasks] = await db.query(query, [hodId]);
    return tasks;
  }
}

module.exports = Task;
