import React, { useState, useEffect } from "react";
import { getAssignedSubtasks, updateStaffSubtaskStatus } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  ClipboardList,
  ArrowRight,
} from "lucide-react";

const StaffTasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [taskCompletionDialog, setTaskCompletionDialog] = useState<{
    open: boolean;
    taskId: string | null;
    taskName: string;
  }>({
    open: false,
    taskId: null,
    taskName: "",
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await getAssignedSubtasks();
      if (response.success) {
        setTasks(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch assigned tasks");
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      setSubmittingTaskId(taskId);
      const response = await updateStaffSubtaskStatus(taskId);

      if (response.success) {
        toast.success("Task submitted for review");

        // Update task status in UI
        setTasks(
          tasks.map((task) =>
            task.id === taskId ? { ...task, status: "review" } : task
          )
        );
      } else {
        toast.error(response.message || "Failed to update task status");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update task status"
      );
    } finally {
      setSubmittingTaskId(null);
      setTaskCompletionDialog({
        open: false,
        taskId: null,
        taskName: "",
      });
    }
  };

  const openCompletionDialog = (taskId: string, taskName: string) => {
    setTaskCompletionDialog({
      open: true,
      taskId,
      taskName,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "rework":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "in progress":
      case "inprogress":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Calculate days remaining
  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Group tasks by status
  const groupedTasks = tasks.reduce((acc: any, task) => {
    const status = task.status.toLowerCase();
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(task);
    return acc;
  }, {});

  // Order status groups for display
  const statusOrder = [
    "rework",
    "in progress",
    "inprogress",
    "review",
    "completed",
  ];

  const sortedGroups = Object.entries(groupedTasks).sort(
    ([statusA], [statusB]) => {
      const indexA = statusOrder.indexOf(statusA);
      const indexB = statusOrder.indexOf(statusB);
      return indexA - indexB;
    }
  );

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
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Tasks</h1>
          <p className="text-gray-500 mt-1">
            View and manage your assigned tasks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TaskStatCard
            title="Total Tasks"
            count={tasks.length}
            icon={<ClipboardList className="h-5 w-5 text-blue-500" />}
            color="bg-blue-50 text-blue-700"
          />

          <TaskStatCard
            title="In Progress"
            count={
              groupedTasks["in progress"]?.length ||
              groupedTasks["inprogress"]?.length ||
              0
            }
            icon={<Clock className="h-5 w-5 text-purple-500" />}
            color="bg-purple-50 text-purple-700"
          />

          <TaskStatCard
            title="Needs Rework"
            count={groupedTasks["rework"]?.length || 0}
            icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
            color="bg-amber-50 text-amber-700"
          />
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : tasks.length === 0 ? (
          <motion.div
            className="bg-white rounded-xl shadow-sm p-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              No tasks assigned
            </h3>
            <p className="text-gray-500">
              You don't have any tasks assigned at the moment.
            </p>
          </motion.div>
        ) : (
          <>
            {sortedGroups.map(([status, statusTasks]) => (
              <div key={status} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(status)}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                  <h2 className="text-lg font-semibold text-gray-700">
                    {(statusTasks as any[]).length} Task
                    {(statusTasks as any[]).length !== 1 ? "s" : ""}
                  </h2>
                </div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {(statusTasks as any[]).map((task) => (
                    <motion.div key={task.id} variants={item}>
                      <Card
                        className="overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
                        onClick={() => openCompletionDialog(task.id, task.name)}
                      >
                        <CardHeader
                          className={`${
                            status === "rework"
                              ? "bg-amber-50"
                              : status === "review"
                              ? "bg-blue-50"
                              : status === "completed"
                              ? "bg-green-50"
                              : "bg-purple-50"
                          } pb-4`}
                        >
                          <div className="flex justify-between items-start">
                            <Badge className={getStatusColor(status)}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Badge>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg mt-2">
                            {task.name}
                          </CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <ClipboardList className="h-4 w-4 mr-1 text-gray-500" />
                            <span className="truncate">{task.task_name}</span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {task.description}
                          </p>

                          <div className="flex justify-between items-center text-sm mt-3">
                            <div className="flex items-center text-gray-500">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>Due: {formatDate(task.due_date)}</span>
                            </div>
                            <TaskDueBadge
                              daysRemaining={getDaysRemaining(task.due_date)}
                            />
                          </div>
                        </CardContent>
                        {(status === "in progress" ||
                          status === "inprogress" ||
                          status === "rework") && (
                          <CardFooter className="pt-0">
                            <Button
                              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card click event
                                openCompletionDialog(task.id, task.name);
                              }}
                              disabled={submittingTaskId === task.id}
                            >
                              {submittingTaskId === task.id ? (
                                <div className="flex items-center">
                                  <span className="animate-spin mr-2">
                                    <svg
                                      className="h-5 w-5"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                  </span>
                                  Submitting...
                                </div>
                              ) : (
                                <>
                                  <ArrowRight className="mr-2 h-4 w-4" />
                                  Submit for Review
                                </>
                              )}
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ))}
          </>
        )}
      </motion.div>

      {/* Task Completion Confirmation Dialog */}
      <AlertDialog
        open={taskCompletionDialog.open}
        onOpenChange={(open) =>
          setTaskCompletionDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Task for Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit "{taskCompletionDialog.taskName}"
              for review? Your HOD will review your work and either mark it as
              complete or request additional changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (taskCompletionDialog.taskId) {
                  handleCompleteTask(taskCompletionDialog.taskId);
                }
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Submit for Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

// Task Stat Card Component
const TaskStatCard = ({
  title,
  count,
  icon,
  color,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-lg shadow-sm p-4 ${color}`}
  >
    <div className="flex items-center justify-between">
      <h3 className="font-medium">{title}</h3>
      {icon}
    </div>
    <p className="text-3xl font-bold mt-2">{count}</p>
  </motion.div>
);

// Task Due Badge Component
const TaskDueBadge = ({ daysRemaining }: { daysRemaining: number }) => {
  let color = "bg-gray-100 text-gray-800";

  if (daysRemaining < 0) {
    color = "bg-red-100 text-red-800";
  } else if (daysRemaining <= 2) {
    color = "bg-orange-100 text-orange-800";
  } else if (daysRemaining <= 5) {
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

export default StaffTasks;
