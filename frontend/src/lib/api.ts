import axios from "axios";

// Create an axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:8081", // Backend is running on port 8081
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the token to every request
api.interceptors.request.use(
  (config) => {
    // Get token from cookies if it exists
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("ssid="))
      ?.split("=")[1];

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Create common API calls
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.post("/api/auth/logout");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin API calls
export const getStaffRankings = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(
      `/api/staff/rankings?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const registerStaff = async (staffData: {
  name: string;
  email: string;
  password: string;
  department_id: string;
}) => {
  try {
    const response = await api.post("/api/staff/register", {
      name: staffData.name,
      email: staffData.email,
      password: staffData.password,
      dpt: staffData.department_id,
      role: "staff",
      mob: "", // Optional mobile number
      workload: 0 // Default workload
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// HOD API calls
export const getDepartmentTasks = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(
      `/api/dpt/tasks?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTaskDetails = async (taskId: string) => {
  try {
    const response = await api.get(`/api/dpt/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createTask = async (taskData: {
  name: string;
  description: string;
  due_date: string;
  department_id: string;
}) => {
  try {
    const response = await api.post("/api/dpt/tasks", taskData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDepartmentSubtasks = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(
      `/api/dpt/stask?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSubtasksByParentId = async (parentId: string) => {
  try {
    const response = await api.get(`/api/dpt/stask/${parentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDepartmentStaff = async () => {
  try {
    const response = await api.get("/api/dpt/staff/tasks");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createSubtask = async (
  parentId: string,
  subtaskData: {
    name: string;
    description: string;
    priority: string;
    assigned_employees: string[];
    due_date: string;
  }
) => {
  try {
    const response = await api.post(`/api/dpt/stask/${parentId}`, subtaskData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDepartmentReviewSubtasks = async () => {
  try {
    const response = await api.get("/api/dpt/stask/review");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSubtaskDetails = async (subtaskId: string) => {
  try {
    const response = await api.get(`/api/subtasks/${subtaskId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching subtask details:", error);
    throw error;
  }
};

export const updateSubtaskStatus = async (subtaskId: string, status: string) => {
  try {
    const response = await api.patch(`/api/subtasks/${subtaskId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating subtask status:", error);
    throw error;
  }
};

export const deleteSubtask = async (subtaskId: string) => {
  try {
    const response = await api.delete(`/api/dpt/stask/${subtaskId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Staff API calls
export const getAssignedSubtasks = async () => {
  try {
    const response = await api.get("/api/staff/stask");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStaffSubtaskStatus = async (subtaskId: string) => {
  try {
    const response = await api.put(`/api/staff/stask/${subtaskId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Notification API
export const createNotification = async (data: { userId: string; message: string; type: string }) => {
  try {
    const response = await api.post("/api/notifications", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getNotifications = async (userId: string) => {
  try {
    const response = await api.get(`/api/notifications/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const response = await api.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteNotification = async (notificationId: string) => {
  try {
    const response = await api.delete(`/api/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const generateStaffReport = async (staffId: string) => {
  try {
    const response = await api.get(`/api/staff/report/${staffId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const generateReport = async (type: string) => {
  try {
    const response = await api.get(`/api/reports/${type}`);
    return response.data;
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
};

export const getAdminStats = async () => {
  try {
    const response = await api.get('/api/admin/stats');
    return response.data;
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw error;
  }
};

export default api;
