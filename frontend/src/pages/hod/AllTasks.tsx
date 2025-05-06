import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDepartmentTasks } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Calendar,
  ArrowRight,
  Search,
  ClipboardList,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AllTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTasks(1);
  }, []);

  const fetchTasks = async (page: number) => {
    try {
      setLoading(true);
      const response = await getDepartmentTasks(page, pagination.limit);
      if (response.success) {
        console.log(response.data);
        // Calculate progress based on pending_subtasks_count
        const tasksWithProgress = response.data.map((task: any) => {
          const totalSubtasks = task.sub_task_count || 0;
          const pendingSubtasks = task.pending_subtasks_count || 0;
          console.log(totalSubtasks, pendingSubtasks);
          const completedSubtasks = totalSubtasks - pendingSubtasks;
          const progress =
            totalSubtasks > 0
              ? Math.round((completedSubtasks / totalSubtasks) * 100)
              : 0;

          return {
            ...task,
            progress,
            totalSubtasks,
            pendingSubtasks,
            completedSubtasks,
          };
        });
        setTasks(tasksWithProgress);

        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch tasks");
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "No date";

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchTasks(newPage);
    }
  };

  // Filter tasks based on search term
  const filteredTasks = tasks.filter(
    (task) =>
      searchTerm === "" ||
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get progress color based on percentage
  const getProgressColor = (progress: number) => {
    if (progress < 30) return "text-red-500";
    if (progress < 70) return "text-yellow-500";
    return "text-green-500";
  };

  // Calculate days remaining
  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get status text and icon based on progress
  const getStatusInfo = (progress: number) => {
    if (progress === 100) {
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        text: "Completed",
        color: "text-green-500",
      };
    } else if (progress === 0) {
      return {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        text: "Not Started",
        color: "text-red-500",
      };
    } else {
      return {
        icon: <ClipboardList className="h-5 w-5 text-blue-500" />,
        text: "In Progress",
        color: "text-blue-500",
      };
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <DashboardLayout>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              All Department Tasks
            </h1>
            <p className="text-gray-500 mt-1">
              View and manage all parent tasks in your department
            </p>
          </div>
          <Button
            onClick={() => navigate("/hod/create-task")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Create New Task
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search tasks by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 gap-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {filteredTasks.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <ClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    No tasks found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm
                      ? "Try a different search term or"
                      : "Get started by"}{" "}
                    creating a new task
                  </p>
                  <Button
                    onClick={() => navigate("/hod/`create`-task")}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Create New Task
                  </Button>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const daysRemaining = getDaysRemaining(task.due_date);
                  const status = getStatusInfo(task.progress);

                  return (
                    <motion.div
                      key={task.id}
                      variants={item}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                    >
                      <div
                        className="p-6 cursor-pointer"
                        onClick={() => navigate(`/hod/tasks/${task.id}`)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                          <div className="flex items-center mb-2 sm:mb-0">
                            <div className="flex items-center">
                              {status.icon}
                              <h3 className="text-lg font-semibold ml-2 text-gray-800">
                                {task.name}
                              </h3>
                            </div>
                            <span className={`text-sm ml-3 ${status.color}`}>
                              {status.text}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{formatDate(task.due_date)}</span>
                            </div>
                            <Badge daysRemaining={daysRemaining} />
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {task.description}
                        </p>

                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Progress
                            </span>
                            <span
                              className={`text-sm font-medium ${getProgressColor(
                                task.progress
                              )}`}
                            >
                              {task.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                          <div className="mt-2 flex justify-between text-xs text-gray-500">
                            <span>{task.completedSubtasks} completed</span>
                            <span>{task.pendingSubtasks} pending</span>
                            <span>{task.totalSubtasks} total</span>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                          <Button
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 -mr-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/hod/tasks/${task.id}`);
                            }}
                          >
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

// Badge component to show days remaining
const Badge = ({ daysRemaining }: { daysRemaining: number }) => {
  let color = "bg-gray-100 text-gray-800";

  if (daysRemaining < 0) {
    color = "bg-red-100 text-red-800";
  } else if (daysRemaining <= 3) {
    color = "bg-orange-100 text-orange-800";
  } else if (daysRemaining <= 7) {
    color = "bg-yellow-100 text-yellow-800";
  } else {
    color = "bg-green-100 text-green-800";
  }

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${color}`}>
      {daysRemaining < 0
        ? `${Math.abs(daysRemaining)} days overdue`
        : daysRemaining === 0
        ? "Due today"
        : `${daysRemaining} days left`}
    </span>
  );
};

export default AllTasks;
