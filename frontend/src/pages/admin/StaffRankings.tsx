// 

import React, { useState, useEffect } from "react";
import { getStaffRankings } from "@/lib/api";
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
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Trophy, ArrowUp, ArrowDown, Medal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const StaffRankings = () => {
  const [rankings, setRankings] = useState<any[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings(pagination.page);
  }, []);

  const fetchRankings = async (page: number) => {
    try {
      setLoading(true);
      const response = await getStaffRankings(page, pagination.limit);
      const allStaff = response.data.staff;

      // Get unique departments
      const uniqueDepts = Array.from(new Set(allStaff.map((staff: any) => staff.department_name)));
      setDepartments(uniqueDepts);

      setRankings(allStaff);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error("Failed to fetch staff rankings");
      console.error("Error fetching rankings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchRankings(newPage);
    }
  };

  const getMedalColor = (index: number) => {
    if (index === 0) return "text-yellow-500"; // Gold
    if (index === 1) return "text-gray-400"; // Silver
    if (index === 2) return "text-amber-700"; // Bronze
    return "";
  };

  const filteredRankings =
    selectedDept === "All Departments"
      ? rankings
      : rankings.filter((staff) => staff.department_name === selectedDept);

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
        initial="hidden"
        animate="show"
        variants={container}
      >
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Staff Rankings</h1>
            <p className="text-gray-500 mt-1">
              Performance overview of all staff members
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Departments">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loader */}
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Rankings Table */}
            <motion.div variants={item}>
              <Table>
                <TableCaption>
                  Staff performance rankings based on task completion and
                  quality
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">
                      Efficiency Score
                    </TableHead>
                    <TableHead className="text-right">
                      Completed Tasks
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRankings.map((staff, index) => (
                    <motion.tr
                      key={staff.id}
                      className={index < 3 ? "bg-blue-50/70" : ""}
                      variants={item}
                      initial="hidden"
                      animate="show"
                    >
                      <TableCell className="font-medium text-center">
                        <div className="flex justify-center items-center gap-1">
                          {index < 3 ? (
                            <Medal
                              className={`h-5 w-5 ${getMedalColor(index)}`}
                            />
                          ) : null}
                          <span>{index + 1}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {staff.name}
                      </TableCell>
                      <TableCell>{staff.email}</TableCell>
                      <TableCell>{staff.department_name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="font-semibold">
                            {staff.overall_efficiency}%
                          </span>
                          {index > 0 &&
                            filteredRankings[index - 1] &&
                            (staff.overall_efficiency >
                            filteredRankings[index - 1].overall_efficiency ? (
                              <ArrowUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <ArrowDown className="h-4 w-4 text-red-500" />
                            ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {staff.completed_tasks}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
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

export default StaffRankings;
