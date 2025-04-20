/**
 * Converts various date formats to MySQL timestamp format
 * @param {string|Date} date - The date to convert
 * @returns {string} - MySQL formatted timestamp (YYYY-MM-DD HH:mm:ss)
 * @throws {Error} - If date is invalid or cannot be parsed
 */
const formatDateToMySQL = (date) => {
  try {
    // If it's already a Date object, use it directly
    const dateObj = date instanceof Date ? date : new Date(date);

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date format");
    }

    // Format to MySQL timestamp
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const seconds = String(dateObj.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    throw new Error(`Date conversion error: ${error.message}`);
  }
};

module.exports = {
  formatDateToMySQL,
};
