import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Middleware to validate incoming goal data.
 * Enforces business rules: Max 8 goals, Total Weightage = 100%, Min Weightage = 10%
 */
export const validateGoalSubmission = asyncHandler(async (req, res, next) => {
  const { goals } = req.body;

  if (!goals || !Array.isArray(goals)) {
    res.status(400);
    throw new Error('Invalid request format. Expected an array of goals.');
  }

  // Rule 1: Max 8 goals
  if (goals.length > 8) {
    res.status(400);
    throw new Error('Validation Error: Maximum of 8 goals allowed per employee.');
  }

  let totalWeightage = 0;

  for (let i = 0; i < goals.length; i++) {
    const goal = goals[i];
    
    // Rule 2: Minimum 10% weightage
    if (!goal.weightage || goal.weightage < 10) {
      res.status(400);
      throw new Error(`Validation Error: Goal "${goal.title || 'Unknown'}" must have a minimum weightage of 10%.`);
    }

    totalWeightage += goal.weightage;
  }

  // Rule 3: Total Weightage exactly 100%
  if (totalWeightage !== 100) {
    res.status(400);
    throw new Error(`Validation Error: Total weightage must equal exactly 100%. Current total is ${totalWeightage}%.`);
  }

  // All validation passed
  next();
});
