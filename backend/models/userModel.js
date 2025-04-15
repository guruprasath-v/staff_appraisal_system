const db = require("../configs/db");

class User {
  static async findByEmail(email) {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return users[0];
  }

  static async createUser(userData) {
    const { name, email, mob, password, role, dpt, workload } = userData;

    const [result] = await db.query(
      "INSERT INTO users (id, name, email, mob, password, role, dpt, workload) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)",
      [name, email, mob, password, role, dpt, workload]
    );

    return result;
  }

  static async findById(id) {
    const [users] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    return users[0];
  }
}

module.exports = User;
