const db = require("../db");

class Department {
  static async incrementStaffCount(departmentId) {
    const query = `
      UPDATE departments 
      SET staff_count = staff_count + 1 
      WHERE id = ?
    `;

    await db.query(query, [departmentId]);
  }

  static async getStaffCount(departmentId) {
    const query = `
      SELECT staff_count 
      FROM departments 
      WHERE id = ?
    `;

    const [[result]] = await db.query(query, [departmentId]);
    return result ? result.staff_count : 0;
  }
}

module.exports = Department;
