import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Admin Pages
import StaffRankings from "./pages/admin/StaffRankings";

// User Creation
import CreateUser from "./pages/hod/CreateUser";

// HOD Pages
import DepartmentSubtasks from "./pages/hod/DepartmentSubtasks";
import CreateTask from "./pages/hod/CreateTask";
import TaskDetails from "./pages/hod/TaskDetails";
import AllTasks from "./pages/hod/AllTasks";
import PendingReviews from "./pages/hod/PendingReviews";

// Staff Pages
import StaffTasks from "./pages/staff/StaffTasks";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Default redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <StaffRankings />
                </ProtectedRoute>
              }
            />

            {/* HOD Routes */}
            <Route
              path="/hod"
              element={
                <ProtectedRoute allowedRoles={["hod"]}>
                  <DepartmentSubtasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod/create-task"
              element={
                <ProtectedRoute allowedRoles={["hod"]}>
                  <CreateTask />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod/tasks/:taskId"
              element={
                <ProtectedRoute allowedRoles={["hod"]}>
                  <TaskDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod/all-tasks"
              element={
                <ProtectedRoute allowedRoles={["hod"]}>
                  <AllTasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod/pending-reviews"
              element={
                <ProtectedRoute allowedRoles={["hod"]}>
                  <PendingReviews />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod/create-user"
              element={
                <ProtectedRoute allowedRoles={["hod"]}>
                  <CreateUser />
                </ProtectedRoute>
              }
            />

            {/* Staff Routes */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={["staff"]}>
                  <StaffTasks />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
