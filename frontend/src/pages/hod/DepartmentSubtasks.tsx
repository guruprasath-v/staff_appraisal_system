import React, { useState, useEffect } from "react";
import { getDepartmentSubtasks, updateSubtaskStatus } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Pencil, Trash2, AlertCircle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const DepartmentSubtasks = () => {
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editSubtask, setEditSubtask] = useState<any>(null);
  const [deleteSubtaskId, setDeleteSubtaskId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    status: "",
    priority: "",
    due_date: "",
    description: "",
  });

  useEffect(() => {
    fetchSubtasks(1);
  }, []);

  useEffect(() => {
    if (editSubtask) {
      setEditFormData({
        status: editSubtask.status,
        priority: editSubtask.priority,
        due_date: editSubtask.due_date.split("T")[0], // Format date for input
        description: editSubtask.description || "",
      });
    }
  }, [editSubtask]);

  const fetchSubtasks = async (page: number) => {
    try {
      setLoading(true);
      const response = await getDepartmentSubtasks(page, pagination.limit);
      if (response.success) {
        setSubtasks(response.data.subtasks);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error("Failed to fetch department subtasks");
      console.error("Error fetching subtasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubtask = async () => {
    try {
      if (!editSubtask) return;

      const response = await updateSubtaskStatus(editSubtask.id, {
        status: editFormData.status,
        priority: editFormData.priority,
        due_date: editFormData.due_date,
        description: editFormData.description,
      });

      if (response.success) {
        toast.success("Subtask updated successfully");
        setEditSubtask(null);
        fetchSubtasks(pagination.page); // Refresh the list
      } else {
        toast.error(response.message || "Failed to update subtask");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update subtask");
    }
  };

  const handleDeleteSubtask = async () => {
    try {
      if (!deleteSubtaskId) return;

      // Call API to delete subtask
      // This is a placeholder - you'll need to implement the actual API call
      // const response = await deleteSubtask(deleteSubtaskId);

      // For now, we'll simulate a successful deletion
      toast.success("Subtask deleted successfully");
      setDeleteSubtaskId(null);

      // Update the local state to remove the deleted subtask
      setSubtasks(subtasks.filter((subtask) => subtask.id !== deleteSubtaskId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete subtask");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchSubtasks(newPage);
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

  // Filter subtasks based on search term and status
  const filteredSubtasks = subtasks.filter((subtask) => {
    const matchesSearch =
      searchTerm === "" ||
      subtask.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subtask.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subtask.task_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      subtask.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Department Subtasks
            </h1>
            <p className="text-gray-500 mt-1">
              View and manage all subtasks in your department
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex-1">
            <Input
              placeholder="Search by task, name or assignee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rework">Rework</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <motion.div
              className="bg-white rounded-xl shadow-md overflow-hidden"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <div className="overflow-x-auto">
                <Table>
                  <TableCaption>
                    List of subtasks in your department
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Parent Task</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Rework Count</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubtasks.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-8 text-gray-500"
                        >
                          No subtasks found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubtasks.map((subtask) => (
                        <motion.tr key={subtask.id} variants={item}>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {subtask.name}
                          </TableCell>
                          <TableCell>{subtask.task_name}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{subtask.employee_name}</span>
                              <span className="text-xs text-gray-500">
                                {subtask.employee_email}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(subtask.status)}>
                              {subtask.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getPriorityColor(subtask.priority)}
                            >
                              {subtask.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(subtask.due_date)}</TableCell>
                          <TableCell className="text-center">
                            {subtask.rework_count || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Dialog
                                open={editSubtask?.id === subtask.id}
                                onOpenChange={(open) =>
                                  !open && setEditSubtask(null)
                                }
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditSubtask(subtask)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Pencil className="h-4 w-4 text-blue-500" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Subtask</DialogTitle>
                                    <DialogDescription>
                                      Update the details of this subtask.
                                    </DialogDescription>
                                  </DialogHeader>

                                  <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label
                                        htmlFor="status"
                                        className="text-right"
                                      >
                                        Status
                                      </Label>
                                      <div className="col-span-3">
                                        <Select
                                          value={editFormData.status}
                                          onValueChange={(value) =>
                                            setEditFormData({
                                              ...editFormData,
                                              status: value,
                                            })
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="pending">
                                              Pending
                                            </SelectItem>
                                            <SelectItem value="in progress">
                                              In Progress
                                            </SelectItem>
                                            <SelectItem value="review">
                                              Review
                                            </SelectItem>
                                            <SelectItem value="completed">
                                              Completed
                                            </SelectItem>
                                            <SelectItem value="rework">
                                              Rework
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label
                                        htmlFor="priority"
                                        className="text-right"
                                      >
                                        Priority
                                      </Label>
                                      <div className="col-span-3">
                                        <Select
                                          value={editFormData.priority}
                                          onValueChange={(value) =>
                                            setEditFormData({
                                              ...editFormData,
                                              priority: value,
                                            })
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="low">
                                              Low
                                            </SelectItem>
                                            <SelectItem value="medium">
                                              Medium
                                            </SelectItem>
                                            <SelectItem value="high">
                                              High
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label
                                        htmlFor="due_date"
                                        className="text-right"
                                      >
                                        Due Date
                                      </Label>
                                      <Input
                                        id="due_date"
                                        type="date"
                                        value={editFormData.due_date}
                                        onChange={(e) =>
                                          setEditFormData({
                                            ...editFormData,
                                            due_date: e.target.value,
                                          })
                                        }
                                        className="col-span-3"
                                      />
                                    </div>

                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label
                                        htmlFor="description"
                                        className="text-right"
                                      >
                                        Description
                                      </Label>
                                      <Textarea
                                        id="description"
                                        value={editFormData.description}
                                        onChange={(e) =>
                                          setEditFormData({
                                            ...editFormData,
                                            description: e.target.value,
                                          })
                                        }
                                        className="col-span-3"
                                        rows={3}
                                      />
                                    </div>
                                  </div>

                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => setEditSubtask(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button onClick={handleEditSubtask}>
                                      Save Changes
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <AlertDialog
                                open={deleteSubtaskId === subtask.id}
                                onOpenChange={(open) =>
                                  !open && setDeleteSubtaskId(null)
                                }
                              >
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setDeleteSubtaskId(subtask.id)
                                    }
                                    className="h-8 w-8 p-0"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete the subtask and remove
                                      it from our servers.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={handleDeleteSubtask}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
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

export default DepartmentSubtasks;
