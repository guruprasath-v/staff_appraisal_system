
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTask } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar } from 'lucide-react';

// Validation schema for task
const createTaskSchema = z.object({
  name: z.string().min(3, { message: 'Task name must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  due_date: z.string().refine((date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, { message: 'Due date cannot be in the past' }),
  department_id: z.string(),
});

type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

const CreateTask = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departmentId, setDepartmentId] = useState('');

  useEffect(() => {
    // We'll have department ID from the user object in a real app
    // For now, let's default to one of the example department IDs
    setDepartmentId('bcedf234-1904-11f0-ae41-f854f61bb226');
  }, [user]);

  // Initialize form
  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      name: '',
      description: '',
      due_date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      department_id: departmentId,
    },
  });

  // Update form's department_id when departmentId changes
  useEffect(() => {
    form.setValue('department_id', departmentId);
  }, [departmentId, form]);

  const onSubmit = async (data: CreateTaskFormValues) => {
    try {
      setIsSubmitting(true);
      const response = await createTask(data);
      if (response.success) {
        toast.success('Task created successfully!');
        navigate(`/hod/tasks/${response.data.id}`);
      } else {
        toast.error(response.message || 'Failed to create task');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 flex items-center space-x-4">
          <Plus className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Create New Task</h1>
            <p className="text-gray-500">Create a parent task for your department</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Backend Development" {...field} />
                    </FormControl>
                    <FormDescription>
                      A clear, concise name for the parent task
                    </FormDescription>
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
                        placeholder="Develop the backend services for the new customer portal..." 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a detailed description of the task objectives
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="date" 
                          {...field} 
                        />
                        <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      The deadline for completing this parent task
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/hod')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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
                      Creating...
                    </div>
                  ) : (
                    'Create Task'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default CreateTask;
