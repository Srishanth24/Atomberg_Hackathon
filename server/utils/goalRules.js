export const validateGoalSheet = (goals = []) => {
  if (!Array.isArray(goals) || goals.length === 0) {
    return 'At least one goal is required.';
  }

  if (goals.length > 8) {
    return 'Maximum of 8 goals allowed per employee.';
  }

  const totalWeightage = goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0);
  const belowMinimum = goals.find(goal => Number(goal.weightage || 0) < 10);

  if (belowMinimum) {
    return `Goal "${belowMinimum.title || 'Untitled'}" must have a minimum weightage of 10%.`;
  }

  if (totalWeightage !== 100) {
    return `Total weightage must equal exactly 100%. Current total is ${totalWeightage}%.`;
  }

  return null;
};

export const computeProgress = (uom, target, actual) => {
  if (actual === null || actual === undefined || actual === '') return 0;

  if (uom === 'Min (Numeric / %)') {
    const targetValue = Number(target);
    if (!targetValue) return 0;
    return Math.min(Math.round((Number(actual) / targetValue) * 100), 100);
  }

  if (uom === 'Max (Numeric / %)') {
    const actualValue = Number(actual);
    if (actualValue === 0) return 100;
    return Math.min(Math.round((Number(target) / actualValue) * 100), 100);
  }

  if (uom === 'Timeline') {
    const deadline = new Date(target).getTime();
    const completionDate = new Date(actual).getTime();
    if (Number.isNaN(deadline) || Number.isNaN(completionDate)) return 0;
    return completionDate <= deadline ? 100 : 0;
  }

  if (uom === 'Zero-based') {
    return Number(actual) === 0 ? 100 : 0;
  }

  return 0;
};
