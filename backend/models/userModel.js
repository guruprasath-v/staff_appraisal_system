const db = require("../configs/db");
const Department = require("./departmentModel");

class User {
  static async updateTaskCompletionMetrics(userId, efficiency) {
    const query = `
      UPDATE users
      SET tasks_completed_count = tasks_completed_count + 1,
          pending_count = pending_count - 1,
          overall_efficiency = ?
      WHERE id = ?
    `;
    await db.query(query, [efficiency, userId]);
  }

  static async getUserMetrics(userId) {
    const query = `
      SELECT tasks_completed_count, pending_count, overall_efficiency, workload
      FROM users
      WHERE id = ?
    `;
    const [[user]] = await db.query(query, [userId]);
    return user;
  }

  static async findByEmail(email) {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return users[0];
  }

  static async createUser(userData) {
    const { name, email, mob, password, role, dpt, workload } = userData;

    try {
      // Start a transaction
      await db.query('START TRANSACTION');

      // Insert the user
      const [result] = await db.query(
        "INSERT INTO users (id, name, email, mob, password, role, dpt, workload) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)",
        [name, email, mob || "", password, role, dpt, workload || 0]
      );

      // Get the inserted user's ID
      const [[user]] = await db.query(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );

      // Increment the department's staff count
      await Department.incrementStaffCount(dpt);

      // Commit the transaction
      await db.query('COMMIT');

      return user;
    } catch (error) {
      // Rollback in case of error
      await db.query('ROLLBACK');
      throw error;
    }
  }

  static async findById(id) {
    const [users] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    return users[0];
  }

  static async updatePendingCount(userId, increment = 1) {
    const query = `UPDATE users SET pending_count = pending_count + ? WHERE id = ?`;
    await db.query(query, [increment, userId]);
  }

  static async getRankings(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const countQuery = `SELECT COUNT(*) as total FROM users WHERE role = 'staff'`;
    const [[{ total }]] = await db.query(countQuery);

    const query = `
      SELECT u.id, u.name, u.email, u.dpt as department_id, 
             d.name as department_name, u.overall_efficiency,
             u.tasks_completed_count as completed_tasks
      FROM users u
      LEFT JOIN departments d ON u.dpt = d.id
      WHERE u.role = 'staff'
      ORDER BY u.overall_efficiency DESC
      LIMIT ? OFFSET ?
    `;

    const [staff] = await db.query(query, [limit, offset]);
    const totalPages = Math.ceil(total / limit);

    return {
      staff,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}

module.exports = User;
