
import React, { useState, useEffect } from 'react';
import { getDepartmentReviewSubtasks, updateSubtaskStatus } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  CheckCircle2, XCircle, 
  Clock, User, Calendar,
  ClipboardList, AlertTriangle
} from 'lucide-react';

const PendingReviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubtask, setSelectedSubtask] = useState<any>(null);
  const [actionType, setActionType] = useState<'complete' | 'rework'>('complete');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [qualityOfWork, setQualityOfWork] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getDepartmentReviewSubtasks();
      if (response.success) {
        setReviews(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch review subtasks');
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedSubtask) return;
    
    try {
      setIsSubmitting(true);
      
      const data: any = {
        status: actionType === 'complete' ? 'completed' : 'rework',
      };
      
      // Only include quality_of_work if completing the task
      if (actionType === 'complete') {
        if (!qualityOfWork) {
          toast.error('Please provide quality of work feedback');
          return;
        }
        data.quality_of_work = qualityOfWork;
      }
      
      const response = await updateSubtaskStatus(selectedSubtask.id, data);
      
      if (response.success) {
        toast.success(`Subtask marked as ${actionType === 'complete' ? 'completed' : 'needs rework'}`);
        setDialogOpen(false);
        
        // Remove the updated subtask from the list
        setReviews(reviews.filter(review => review.id !== selectedSubtask.id));
        
        // Reset form
        setSelectedSubtask(null);
        setQualityOfWork('');
      } else {
        toast.error(response.message || 'Failed to update subtask');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update subtask');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDialog = (subtask: any, type: 'complete' | 'rework') => {
    setSelectedSubtask(subtask);
    setActionType(type);
    setDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
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
            <h1 className="text-2xl font-bold text-gray-800">Pending Reviews</h1>
            <p className="text-gray-500 mt-1">
              Review and approve completed work from your team
            </p>
          </div>
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-sm">
            {reviews.length} Pending
          </Badge>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {reviews.length === 0 ? (
              <motion.div
                className="bg-white rounded-xl shadow-sm p-12 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No pending reviews</h3>
                <p className="text-gray-500">
                  All submitted work has been reviewed. Great job!
                </p>
              </motion.div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {reviews.map((review) => (
                  <motion.div key={review.id} variants={item}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                      <CardHeader className="bg-blue-50 pb-4">
                        <div className="flex justify-between items-start">
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            Needs Review
                          </Badge>
                          <Clock className="h-5 w-5 text-blue-500" />
                        </div>
                        <CardTitle className="text-lg mt-2">{review.name}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <ClipboardList className="h-4 w-4 mr-1 text-gray-500" />
                          <span className="truncate">{review.task_name || 'Parent Task'}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {review.description}
                        </p>
                        
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center text-gray-500">
                              <User className="h-4 w-4 mr-2" />
                              <span>Assignee:</span>
                            </div>
                            <span className="font-medium truncate max-w-[150px]">
                              {review.employee_name}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="flex items-center text-gray-500">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>Due Date:</span>
                            </div>
                            <span className="font-medium">
                              {formatDate(review.due_date)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="flex items-center text-gray-500">
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              <span>Priority:</span>
                            </div>
                            <Badge 
                              className={
                                review.priority.toLowerCase() === 'high'
                                  ? 'bg-red-100 text-red-800 border-red-200'
                                  : review.priority.toLowerCase() === 'medium'
                                  ? 'bg-orange-100 text-orange-800 border-orange-200'
                                  : 'bg-green-100 text-green-800 border-green-200'
                              }
                            >
                              {review.priority}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <Button
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          onClick={() => openDialog(review, 'rework')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rework
                        </Button>
                        <Button
                          className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                          onClick={() => openDialog(review, 'complete')}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Complete
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </motion.div>

      {/* Dialog for completing or requesting rework */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'complete' ? 'Complete Task' : 'Request Rework'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'complete' 
                ? 'Please provide feedback on the quality of work before completing.'
                : 'Are you sure you want to request rework for this task?'
              }
            </DialogDescription>
          </DialogHeader>
          
          {actionType === 'complete' && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="quality">Quality of Work</Label>
                <Select 
                  value={qualityOfWork} 
                  onValueChange={setQualityOfWork}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="satisfactory">Satisfactory</SelectItem>
                    <SelectItem value="needs improvement">Needs Improvement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={isSubmitting || (actionType === 'complete' && !qualityOfWork)}
              className={actionType === 'complete' 
                ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600'
                : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600'
              }
            >
              {isSubmitting ? (
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
                  Updating...
                </div>
              ) : actionType === 'complete' ? (
                'Mark as Complete'
              ) : (
                'Request Rework'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PendingReviews;
