const calculateEfficiency = ({
  qualityOfWork,
  createdDate,
  workload,
  pendingTasks,
  reworkCount,
  tasksCompletedCount,
}) => {
  // Map string quality ratings to numeric values
  let qualityValue;
  if (typeof qualityOfWork === "string") {
    switch (qualityOfWork.toLowerCase()) {
      case "excellent":
        qualityValue = 100;
        break;
      case "good":
        qualityValue = 80;
        break;
      case "satisfactory":
        qualityValue = 60;
        break;
      case "needs improvement":
        qualityValue = 40;
        break;
      default:
        qualityValue = 50; // Default value
    }
  } else {
    qualityValue = qualityOfWork || 50; // Fallback to 50 if undefined or null
  }

  // Base score components (total 60% weight)
  // Quality of work (30% weight)
  const qualityScore = qualityValue * 0.3;

  // Calculate duration score (15% weight)
  const duration = Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(createdDate).getTime()) / (1000 * 60 * 60 * 24)
    )
  ); // in days
  // Use logarithmic scaling for duration (faster completion = higher score)
  const durationScore =
    Math.min(100, 100 * (1 / Math.log2(duration + 1))) * 0.15;

  // Workload score (15% weight)
  // Use logarithmic scaling for workload to prevent excessive scores
  const workloadScore =
    Math.min(100, 100 * (Math.log2(workload + 1) / 5)) * 0.15;

  // Task completion score (40% weight)
  // Use a sigmoid-like function to scale completed tasks
  const completedTasksScore =
    calculateCompletedTasksScore(tasksCompletedCount) * 0.4;

  // Penalty components (can reduce score but not below 0)
  // Pending tasks penalty (up to -10%)
  const pendingPenalty = Math.min(10, pendingTasks * 2) * 0.1;

  // Rework penalty (up to -10%)
  const reworkPenalty = Math.min(10, reworkCount * 5) * 0.1;

  // Calculate total efficiency (0-100 scale)
  const totalScore = Math.max(
    0,
    Math.min(
      100,
      qualityScore +
        durationScore +
        workloadScore +
        completedTasksScore -
        (pendingPenalty + reworkPenalty) * 100
    )
  );

  return Math.round(totalScore);
};

// Helper function to calculate score based on completed tasks
const calculateCompletedTasksScore = (completedTasks) => {
  // Base score for having completed at least one task
  const baseScore = 20;

  // If no tasks completed, return 0
  if (completedTasks === 0) return 0;

  // Use a modified sigmoid function for scaling
  // This provides a smooth curve that:
  // - Starts at baseScore for 1 task
  // - Approaches 100 as tasks increase
  // - Has diminishing returns for very high numbers
  const sigmoid = (x) => 1 / (1 + Math.exp(-x));

  // Scale the input to control the curve steepness
  const scaledTasks = (completedTasks - 1) / 10;

  // Calculate score using sigmoid and scale to 0-100 range
  const score = baseScore + 80 * sigmoid(scaledTasks);

  return Math.min(100, score);
};

const calculateOverallEfficiency = (
  currentEfficiency,
  tasksCompletedCount,
  previousOverallEfficiency
) => {
  // If this is the first task, use a conservative initial score
  if (previousOverallEfficiency === 0) {
    return Math.min(70, currentEfficiency); // Cap initial score at 70
  }

  // Calculate weight using a modified logarithmic function
  // This ensures:
  // - More weight to new tasks when count is low
  // - Gradually decreasing weight as count increases
  // - Never completely ignoring new tasks
  const baseWeight = 0.3; // Minimum weight for new tasks
  const weight = baseWeight + 0.7 / Math.log10(tasksCompletedCount + 2);

  // Calculate new overall efficiency with weighted average
  const newEfficiency =
    currentEfficiency * weight + previousOverallEfficiency * (1 - weight);

  // Apply a small bonus for consistency (up to 5 points)
  const consistencyBonus = Math.min(5, tasksCompletedCount / 10);

  // Ensure the score stays within 0-100
  return Math.min(
    100,
    Math.max(0, Math.round(newEfficiency + consistencyBonus))
  );
};

module.exports = {
  calculateEfficiency,
  calculateOverallEfficiency,
};
