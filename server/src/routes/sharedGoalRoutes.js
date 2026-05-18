import express from 'express';
import SharedGoal from '../../models/SharedGoal.js';
import Goal from '../../models/Goal.js';
import User from '../../models/User.js';
import { protect } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/role.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { computeProgress } from '../../utils/goalRules.js';
import { logAuditEvent } from '../../services/auditService.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('manager', 'admin'), asyncHandler(async (req, res) => {
  const sharedGoals = await SharedGoal.find({})
    .populate('createdBy', 'name email')
    .populate('assignedEmployees', 'name email')
    .sort({ updatedAt: -1 });

  const data = await Promise.all(sharedGoals.map(async (sharedGoal) => {
    const linkedGoals = await Goal.find({ linkedSharedGoalId: sharedGoal._id }).populate('employeeId', 'name email');
    return {
      id: sharedGoal._id,
      title: sharedGoal.title,
      description: sharedGoal.description,
      thrustArea: sharedGoal.thrustArea,
      uom: sharedGoal.uom,
      target: sharedGoal.target,
      owner: sharedGoal.createdBy?.name,
      progress: sharedGoal.globalProgress,
      syncStatus: 'Synced',
      linkedEmployees: linkedGoals.map(goal => goal.employeeId?.name),
      children: linkedGoals.map(goal => ({
        goalId: goal._id,
        name: goal.employeeId?.name,
        progress: goal.progress,
        weightage: goal.weightage,
      })),
    };
  }));

  res.json({ success: true, data });
}));

router.post('/', protect, authorizeRoles('manager', 'admin'), asyncHandler(async (req, res) => {
  const employees = req.body.assignedEmployeeIds?.length
    ? await User.find({ _id: { $in: req.body.assignedEmployeeIds } })
    : await User.find({ role: 'employee', managerId: req.user._id });

  const sharedGoal = await SharedGoal.create({
    title: req.body.title,
    description: req.body.description,
    thrustArea: req.body.thrustArea,
    uom: req.body.uom,
    target: req.body.target,
    createdBy: req.user._id,
    assignedEmployees: employees.map(employee => employee._id),
    primaryOwnerId: req.user._id,
  });

  await Goal.insertMany(employees.map(employee => ({
    employeeId: employee._id,
    title: sharedGoal.title,
    description: sharedGoal.description,
    thrustArea: sharedGoal.thrustArea,
    uom: sharedGoal.uom,
    target: sharedGoal.target,
    weightage: req.body.defaultWeightage || 10,
    status: 'submitted',
    linkedSharedGoalId: sharedGoal._id,
    primaryOwnerId: req.user._id,
  })));

  await logAuditEvent({
    action: 'Created Shared Goal',
    user: req.user.name,
    role: req.user.role,
    entityType: 'SharedGoal',
    entityId: sharedGoal._id.toString(),
    previousValue: 'None',
    newValue: sharedGoal.title,
  });

  res.status(201).json({ success: true, data: sharedGoal });
}));

router.post('/:id/sync', protect, authorizeRoles('manager', 'admin'), asyncHandler(async (req, res) => {
  const sharedGoal = await SharedGoal.findById(req.params.id);
  if (!sharedGoal) {
    res.status(404);
    throw new Error('Shared goal not found');
  }

  const progress = computeProgress(sharedGoal.uom, sharedGoal.target, req.body.actualAchievement);
  await Goal.updateMany(
    { linkedSharedGoalId: sharedGoal._id },
    { actual: req.body.actualAchievement, progress }
  );

  sharedGoal.globalProgress = progress;
  await sharedGoal.save();

  await logAuditEvent({
    action: 'Shared Goal Synced',
    user: req.user.name,
    role: req.user.role,
    entityType: 'SharedGoal',
    entityId: sharedGoal._id.toString(),
    previousValue: 'Out of Sync',
    newValue: `${progress}%`,
  });

  res.json({ success: true, data: { progress } });
}));

export default router;
