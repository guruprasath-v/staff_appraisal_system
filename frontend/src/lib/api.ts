import axios from "axios";

// Create an axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:8080", // Backend is running on port 8080
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
    const response = await api.post("/api/staff/register", staffData);
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
    assigned_employee: string;
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

export const updateSubtaskStatus = async (
  subtaskId: string,
  statusData: {
    status: string;
    priority?: string;
    due_date?: string;
    description?: string;
    quality_of_work?: string;
  }
) => {
  try {
    const response = await api.put(`/api/dpt/stask/${subtaskId}`, statusData);
    return response.data;
  } catch (error) {
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

export default api;
