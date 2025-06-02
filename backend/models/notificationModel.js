const db = require("../db");
const { v4: uuidv4 } = require("uuid");

class Notification {
  static async create({ userId, message, type }) {
    const id = uuidv4();
    const query = `
      INSERT INTO notifications (id, user_id, message, type, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    
    const [result] = await db.query(query, [id, userId, message, type]);
    return result.insertId;
  }

  static async getByUserId(userId) {
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
      SET is_read = true 
      WHERE id = ?
    `;
    
    const [result] = await db.query(query, [notificationId]);
    return result.affectedRows > 0;
  }

  static async delete(notificationId) {
    const query = `
      DELETE FROM notifications 
      WHERE id = ?
    `;
    
    const [result] = await db.query(query, [notificationId]);
    return result.affectedRows > 0;
  }
}

module.exports = Notification; 