import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSubtaskDetails, updateSubtaskStatus } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Calendar,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SubtaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subtask, setSubtask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSubtaskDetails();
  }, [id]);

  const fetchSubtaskDetails = async () => {
    try {
      setLoading(true);
      const response = await getSubtaskDetails(id!);
      if (response.success) {
        setSubtask(response.data);
      } else {
        toast.error("Failed to fetch subtask details");
      }
    } catch (error) {
      toast.error("Failed to fetch subtask details");
      console.error("Error fetching subtask details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdating(true);
      const response = await updateSubtaskStatus(id!, newStatus);
      if (response.success) {
        toast.success("Subtask status updated successfully");
        fetchSubtaskDetails(); // Refresh subtask details
      } else {
        toast.error(response.message || "Failed to update subtask status");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update subtask status");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!subtask) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Subtask Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            The subtask you're looking for doesn't exist or has been removed.
          </p>
          <Button
            onClick={() => navigate(-1)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">
              Subtask Details
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge className={getStatusColor(subtask.status)}>
              {subtask.status.replace("_", " ").toUpperCase()}
            </Badge>
            <Badge className={getPriorityColor(subtask.priority)}>
              {subtask.priority.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl">{subtask.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Description
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {subtask.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Due Date
                  </h3>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4" />
                    {formatDate(subtask.due_date)}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Assigned To
                  </h3>
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="h-4 w-4" />
                    {subtask.assigned_to?.name || "Unassigned"}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Status
                </h3>
                <Select
                  value={subtask.status}
                  onValueChange={handleStatusChange}
                  disabled={updating}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Parent Task</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Task Name
                    </h3>
                    <p className="text-gray-700">{subtask.parent_task?.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Department
                    </h3>
                    <p className="text-gray-700">
                      {subtask.parent_task?.department?.name}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      navigate(`/hod/task/${subtask.parent_task?.id}`)
                    }
                  >
                    View Parent Task
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">
                        Created on {formatDate(subtask.created_at)}
                      </p>
                      <p className="text-xs text-gray-500">
                        by {subtask.created_by?.name}
                      </p>
                    </div>
                  </div>
                  {subtask.updated_at && (
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <FileText className="h-4 w-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">
                          Last updated on {formatDate(subtask.updated_at)}
                        </p>
                        <p className="text-xs text-gray-500">
                          by {subtask.updated_by?.name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default SubtaskDetails; 