const calculateEfficiency = ({
  qualityOfWork,
  createdDate,
  workload,
  pendingTasks,
  reworkCount,
}) => {
  // Quality of work (scale of 1-10) has highest weight
  const qualityScore = qualityOfWork * 0.4;

  // Calculate duration score (inverse relationship - less duration is better)
  const duration = Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(createdDate).getTime()) / (1000 * 60 * 60 * 24)
    )
  ); // in days
  const durationScore = Math.min(10, 10 / duration) * 0.2;

  // Workload score (inverse relationship - managing high workload is better)
  const workloadScore = Math.min(10, workload) * 0.15;

  // Pending tasks (inverse relationship - less pending tasks is better)
  const pendingScore = Math.max(0, 10 - pendingTasks) * 0.15;

  // Rework count (inverse relationship - less rework is better)
  const reworkScore = Math.max(0, 10 - reworkCount * 2) * 0.1;

  // Calculate total efficiency (0-10 scale)
  return Math.min(
    10,
    qualityScore + durationScore + workloadScore + pendingScore + reworkScore
  );
};

const calculateOverallEfficiency = (
  currentEfficiency,
  tasksCompletedCount,
  previousOverallEfficiency
) => {
  // If this is the first task (previousOverallEfficiency is 0), return current efficiency
  if (previousOverallEfficiency === 0) {
    return currentEfficiency;
  }

  // For subsequent tasks, use weighted average with logarithmic scaling
  const weight = 1 / Math.log10(tasksCompletedCount + 1);
  return currentEfficiency * weight + previousOverallEfficiency * (1 - weight);
};

module.exports = {
  calculateEfficiency,
  calculateOverallEfficiency,
};
