const db = require("../configs/db");
const { v4: uuidv4 } = require("uuid");

class Notification {
  static async create({ userId, message, type, read = false }) {
    const id = uuidv4();
    const query = `
      INSERT INTO notifications (id, user_id, message, type, \`read\`)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.query(query, [id, userId, message, type, read]);
    return { id, userId, message, type, read };
  }

  static async findByUserId(userId) {
    const query = `
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    const [notifications] = await db.query(query, [userId]);
    return notifications;
  }

  static async markAsRead(notificationId) {
    const query = `
      UPDATE notifications
      SET \`read\` = true
      WHERE id = ?
    `;
    await db.query(query, [notificationId]);
  }

  static async delete(notificationId) {
    const query = `
      DELETE FROM notifications
      WHERE id = ?
    `;
    await db.query(query, [notificationId]);
  }
}

module.exports = Notification; 