import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getSubtasksByParentId,
  createSubtask,
  getDepartmentStaff,
  getTaskDetails,
} from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Clock,
  CheckCircle,
  Calendar,
  AlertCircle,
  ClipboardList,
  Users,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

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

const TaskDetails = () => {
  const [departmentStaff, setDepartmentStaff] = useState([]);
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [taskDetails, setTaskDetails] = useState<any>({
    id: taskId,
    name: "Loading...",
    description: "Loading...",
    due_date: "",
  });
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    completionPercentage: 0,
  });
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
    if (taskId) {
      fetchTaskDetails();
      fetchSubtasks();
      fetchDepartmentStaff();
    }
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      const response = await getTaskDetails(taskId || "");
      if (response.success) {
        setTaskDetails(response.data);
      } else {
        toast.error("Failed to fetch task details");
      }
    } catch (error) {
      toast.error("Failed to fetch task details");
      console.error("Error fetching task details:", error);
    }
  };

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

  const fetchSubtasks = async () => {
    try {
      setLoading(true);
      const response = await getSubtasksByParentId(taskId || "");
      if (response.success) {
        setSubtasks(response.data);

        // Calculate stats
        const total = response.data.length;
        const completed = response.data.filter(
          (st) => st.status.toLowerCase() === "completed"
        ).length;
        const inProgress = response.data.filter((st) =>
          ["in progress", "inprogress", "review"].includes(
            st.status.toLowerCase()
          )
        ).length;
        const pending = total - completed - inProgress;
        const completionPercentage =
          total > 0 ? Math.round((completed / total) * 100) : 0;

        setStats({
          total,
          completed,
          inProgress,
          pending,
          completionPercentage,
        });
      }
    } catch (error) {
      toast.error("Failed to fetch subtasks");
      console.error("Error fetching subtasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CreateSubtaskFormValues) => {
    if (!taskId) return;

    try {
      setIsCreatingSubtask(true);
      const response = await createSubtask(taskId, data as any);
      if (response.success) {
        toast.success("Subtask created successfully!");
        setDialogOpen(false);
        form.reset();
        fetchSubtasks(); // Refresh subtasks list
      } else {
        toast.error(response.message || "Failed to create subtask");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create subtask");
    } finally {
      setIsCreatingSubtask(false);
    }
  };

  // Get status color
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

  // Get priority color
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{taskDetails.name}</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                disabled={taskDetails.status === 'completed'}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Subtask
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Subtask</DialogTitle>
                <DialogDescription>
                  Add a new subtask to "{taskDetails.name}"
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
                      <FormItem className="flex flex-col">
                        <FormLabel>Assign to Staff</FormLabel>
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="justify-between"
                              >
                                {field.value.length > 0
                                  ? `${field.value.length} staff selected`
                                  : "Select staff..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
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
                                      const newValue = field.value.includes(staff.id)
                                        ? field.value.filter((id) => id !== staff.id)
                                        : [...field.value, staff.id];
                                      field.onChange(newValue);
                                      setSelectedEmployees(newValue);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value.includes(staff.id)
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {staff.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedEmployees.map((employeeId) => {
                            const staff = departmentStaff.find((s: any) => s.id === employeeId);
                            return staff ? (
                              <Badge
                                key={employeeId}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                <Users className="h-3 w-3" />
                                {staff.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
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
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Subtasks</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="rounded-full bg-orange-100 p-3 mr-4">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-700">Overall Progress</h3>
            <span className="text-sm font-medium text-gray-700">
              {stats.completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${stats.completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Subtasks Table */}
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Table>
              <TableCaption>
                List of subtasks for {taskDetails.name}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subtasks.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      No subtasks found. Create a subtask to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  subtasks.map((subtask) => (
                    <TableRow
                      key={subtask.id}
                      onClick={() => navigate(`/admin/subtask/${subtask.id}`)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {subtask.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{subtask.employee_name || "Unassigned"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(subtask.status)}>
                          {subtask.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(subtask.priority)}>
                          {subtask.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(subtask.due_date)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TaskDetails; 