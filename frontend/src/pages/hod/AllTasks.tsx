import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDepartmentTasks, createSubtask, getDepartmentStaff } from "@/lib/api";
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
  Plus,
  Users,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Validation schema for subtask
const createSubtaskSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Subtask name must be at least 3 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  priority: z.string().min(1, { message: "Please select a priority" }),
  assigned_employees: z.array(z.string()).min(1, { message: "Please select at least one employee" }),
  due_date: z.string().refine(
    (date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    },
    { message: "Due date cannot be in the past" }
  ),
});

type CreateSubtaskFormValues = z.infer<typeof createSubtaskSchema>;

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
  const [departmentStaff, setDepartmentStaff] = useState([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  // Initialize form
  const form = useForm<CreateSubtaskFormValues>({
    resolver: zodResolver(createSubtaskSchema),
    defaultValues: {
      name: "",
      description: "",
      priority: "",
      assigned_employees: [],
      due_date: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    fetchTasks(1);
    fetchDepartmentStaff();
  }, []);

  const fetchDepartmentStaff = async () => {
    try {
      const response = await getDepartmentStaff();
      if (response.success) {
        setDepartmentStaff(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch department staff");
      console.error("Error fetching department staff:", error);
    }
  };

  const fetchTasks = async (page: number) => {
    try {
      setLoading(true);
      const response = await getDepartmentTasks(page, pagination.limit);
      if (response.success) {
        // Calculate progress based on pending_subtasks_count
        const tasksWithProgress = response.data.map((task: any) => {
          const totalSubtasks = task.sub_task_count || 0;
          const pendingSubtasks = task.pending_subtasks_count || 0;
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

  const onSubmit = async (data: CreateSubtaskFormValues) => {
    if (!selectedTask) return;

    try {
      setIsCreatingSubtask(true);
      const response = await createSubtask(selectedTask.id, data as any);
      if (response.success) {
        toast.success("Subtask created successfully!");
        setDialogOpen(false);
        form.reset();
        fetchTasks(pagination.page); // Refresh tasks list
      } else {
        toast.error(response.message || "Failed to create subtask");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create subtask");
    } finally {
      setIsCreatingSubtask(false);
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
    if (!dueDate) return 0;
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const due = new Date(dueDate);
      due.setHours(0, 0, 0, 0);
      
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return isNaN(diffDays) ? 0 : diffDays;
    } catch (error) {
      console.error('Error calculating days remaining:', error);
      return 0;
    }
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
                    onClick={() => navigate("/hod/create-task")}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Create New Task
                  </Button>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const daysRemaining = getDaysRemaining(task.due_date);
                  const statusInfo = getStatusInfo(task.progress);

                  return (
                    <motion.div
                      key={task.id}
                      variants={item}
                      className="bg-white rounded-xl shadow-sm overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                              {task.name}
                            </h3>
                            <p className="text-gray-500 text-sm mb-4">
                              {task.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Dialog open={dialogOpen && selectedTask?.id === task.id} onOpenChange={(open) => {
                              setDialogOpen(open);
                              if (!open) {
                                setSelectedTask(null);
                                form.reset();
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedTask(task)}
                                  disabled={task.status === 'completed'}
                                  className="flex items-center gap-2"
                                >
                                  <Plus className="h-4 w-4" />
                                  Add Subtask
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                  <DialogTitle>Create New Subtask</DialogTitle>
                                  <DialogDescription>
                                    Add a new subtask to "{task.name}"
                                  </DialogDescription>
                                </DialogHeader>
                                <Form {...form}>
                                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                      control={form.control}
                                      name="name"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Subtask Name</FormLabel>
                                          <FormControl>
                                            <Input placeholder="Implement login API" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name="description"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Description</FormLabel>
                                          <FormControl>
                                            <Textarea
                                              placeholder="Add a detailed description of the subtask..."
                                              className="min-h-[100px]"
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name="priority"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Priority</FormLabel>
                                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select priority" />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              <SelectItem value="low">Low</SelectItem>
                                              <SelectItem value="medium">Medium</SelectItem>
                                              <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name="assigned_employees"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Assign Staff</FormLabel>
                                          <FormControl>
                                            <Popover open={open} onOpenChange={setOpen}>
                                              <PopoverTrigger asChild>
                                                <Button
                                                  variant="outline"
                                                  role="combobox"
                                                  aria-expanded={open}
                                                  className="w-full justify-between"
                                                >
                                                  {field.value.length > 0
                                                    ? `${field.value.length} staff selected`
                                                    : "Select staff..."}
                                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                              </PopoverTrigger>
                                              <PopoverContent className="w-full p-0">
                                                <Command>
                                                  <CommandInput placeholder="Search staff..." />
                                                  <CommandEmpty>No staff found.</CommandEmpty>
                                                  <CommandGroup>
                                                    {departmentStaff.map((staff: any) => (
                                                      <CommandItem
                                                        key={staff.id}
                                                        onSelect={() => {
                                                          const currentValue = field.value || [];
                                                          const newValue = currentValue.includes(staff.id)
                                                            ? currentValue.filter((id: string) => id !== staff.id)
                                                            : [...currentValue, staff.id];
                                                          field.onChange(newValue);
                                                        }}
                                                      >
                                                        <Check
                                                          className={cn(
                                                            "mr-2 h-4 w-4",
                                                            field.value?.includes(staff.id)
                                                              ? "opacity-100"
                                                              : "opacity-0"
                                                          )}
                                                        />
                                                        <div className="flex justify-between items-center w-full">
                                                          <span>{staff.name}</span>
                                                          <Badge variant="secondary" className="ml-2">
                                                            {staff.pending_tasks} pending tasks
                                                          </Badge>
                                                        </div>
                                                      </CommandItem>
                                                    ))}
                                                  </CommandGroup>
                                                </Command>
                                              </PopoverContent>
                                            </Popover>
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name="due_date"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Due Date</FormLabel>
                                          <FormControl>
                                            <Input type="date" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <DialogFooter className="pt-4">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setDialogOpen(false)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        type="submit"
                                        disabled={isCreatingSubtask}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                      >
                                        {isCreatingSubtask ? (
                                          <div className="flex items-center">
                                            <span className="animate-spin mr-2">
                                              <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                                            Creating...
                                          </div>
                                        ) : (
                                          "Create Subtask"
                                        )}
                                      </Button>
                                    </DialogFooter>
                                  </form>
                                </Form>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/hod/tasks/${task.id}`)}
                              className="flex items-center gap-2"
                            >
                              View Details
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Due: {formatDate(task.due_date)} (
                              {daysRemaining > 0
                                ? `${daysRemaining} days left`
                                : "Overdue"}
                              )
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {statusInfo.icon}
                            <span className={statusInfo.color}>
                              {statusInfo.text}
                            </span>
                          </div>
                          <Badge daysRemaining={daysRemaining} />
                        </div>

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
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>

            {/* Pagination and any other content here */}
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default AllTasks;