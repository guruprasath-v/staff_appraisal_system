import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateReport } from "@/lib/api";
import { toast } from "sonner";
import { Download, FileText } from "lucide-react";

const Reports = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async (type: string) => {
    try {
      setIsGenerating(true);
      const response = await generateReport(type);
      if (response.success) {
        // Create a download link for the report
        const link = document.createElement('a');
        link.href = response.data.url;
        link.download = `${type}_report.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Report generated successfully");
      } else {
        toast.error(response.message || "Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Reports</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Department Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Generate a comprehensive report of all departments, including HODs and staff counts.
              </p>
              <Button
                onClick={() => handleGenerateReport('departments')}
                disabled={isGenerating}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Generate Department Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Staff Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Generate a detailed report of all staff members and their performance metrics.
              </p>
              <Button
                onClick={() => handleGenerateReport('staff')}
                disabled={isGenerating}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Generate Staff Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Task Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Generate a report of all tasks and their completion status across departments.
              </p>
              <Button
                onClick={() => handleGenerateReport('tasks')}
                disabled={isGenerating}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Generate Task Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports; 