import { asyncHandler } from '../utils/asyncHandler.js';
import { validateGoalSheet } from '../utils/goalRules.js';

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

  const validationError = validateGoalSheet(goals);
  if (validationError) {
    res.status(400);
    throw new Error(`Validation Error: ${validationError}`);
  }

  next();
});
