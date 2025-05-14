const TaskDetails = () => {
  // ... existing state and functions ...

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{taskDetails.name}</h1>
          <div className="flex gap-4">
            <Button
              onClick={handleSubmitForReview}
              disabled={taskDetails.status === 'completed' || isSubmitting}
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
                  Submitting...
                </div>
              ) : (
                "Submit for Review"
              )}
            </Button>
            {taskDetails.status === 'completed' && (
              <div className="text-sm text-red-500 mt-1">
                Cannot submit completed tasks for review
              </div>
            )}
          </div>
        </div>
        {/* ... rest of the component ... */}
      </div>
    </DashboardLayout>
  );
}; 