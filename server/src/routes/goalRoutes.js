import express from 'express';
import Goal from '../../models/Goal.js';
import Checkin from '../../models/Checkin.js';
import Approval from '../../models/Approval.js';
import User from '../../models/User.js';
import { protect } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/role.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { validateGoalSheet } from '../../utils/goalRules.js';
import { computeProgress } from '../../utils/goalRules.js';
import { validateCheckInWindow, getCheckInWindowError } from '../../utils/quarterlyWindow.js';
import { logAuditEvent } from '../../services/auditService.js';
import { dispatchNotification } from '../../services/notificationService.js';

const router = express.Router();

const serializeGoal = (goal) => ({
  id: goal._id,
  employeeId: goal.employeeId?._id || goal.employeeId,
  employeeName: goal.employeeId?.name || 'Employee',
  title: goal.title,
  description: goal.description || '',
  thrustArea: goal.thrustArea,
  uom: goal.uom,
  target: goal.target,
  actual: goal.actual ?? '',
  weightage: goal.weightage,
  progress: goal.progress,
  lifecycle: goal.status === 'locked' ? 'Approved' : goal.status.charAt(0).toUpperCase() + goal.status.slice(1).replace('_', ' '),
  status: goal.progress === 100 ? 'Completed' : goal.status === 'approved' || goal.status === 'locked' ? 'On Track' : 'Not Started',
  isApproved: goal.status === 'approved' || goal.status === 'locked',
  locked: goal.locked,
  linkedSharedGoalId: goal.linkedSharedGoalId,
  managerComment: goal.managerComment || '',
});

const seedEmployeeGoals = async (employee) => {
  const existing = await Goal.countDocuments({ employeeId: employee._id });
  if (existing > 0) return;

  await Goal.insertMany([
    {
      employeeId: employee._id,
      title: 'Increase Q3 Sales Revenue',
      description: 'Drive measurable revenue progress for the current quarter.',
      thrustArea: 'Revenue Growth',
      uom: 'Min (Numeric / %)',
      target: 500000,
      actual: 375000,
      weightage: 30,
      progress: 75,
      status: 'locked',
      locked: true,
    },
    {
      employeeId: employee._id,
      title: 'Reduce Customer Churn',
      description: 'Keep churn at or below target.',
      thrustArea: 'Customer Success',
      uom: 'Max (Numeric / %)',
      target: 5,
      actual: 5,
      weightage: 40,
      progress: 100,
      status: 'locked',
      locked: true,
    },
    {
      employeeId: employee._id,
      title: 'Launch New Client Portal',
      description: 'Complete launch readiness by deadline.',
      thrustArea: 'Product Development',
      uom: 'Timeline',
      target: '2026-10-01',
      weightage: 20,
      progress: 0,
      status: 'submitted',
    },
    {
      employeeId: employee._id,
      title: 'Zero Safety Incidents',
      description: 'Maintain a zero incident record.',
      thrustArea: 'Operational Excellence',
      uom: 'Zero-based',
      target: 0,
      actual: 0,
      weightage: 10,
      progress: 100,
      status: 'draft',
    },
  ]);
};

router.get('/', protect, authorizeRoles('employee', 'manager', 'admin'), asyncHandler(async (req, res) => {
  if (req.user.role === 'employee') {
    await seedEmployeeGoals(req.user);
  }

  const query = req.user.role === 'employee' ? { employeeId: req.user._id } : {};
  const goals = await Goal.find(query).populate('employeeId', 'name email managerId department').sort({ updatedAt: -1 });
  res.json({ success: true, data: goals.map(serializeGoal) });
}));

router.post('/drafts', protect, authorizeRoles('employee'), asyncHandler(async (req, res) => {
  // Validate weightage
  if (Number(req.body.weightage || 0) < 10) {
    res.status(400);
    throw new Error('Minimum weightage per goal is 10%.');
  }

  // Check goal count limit (max 8)
  const goalCount = await Goal.countDocuments({ employeeId: req.user._id });
  if (goalCount >= 8) {
    res.status(400);
    throw new Error('Maximum of 8 goals allowed per employee.');
  }

  // Check total weightage
  const existingGoals = await Goal.find({ employeeId: req.user._id });
  const totalExistingWeightage = existingGoals.reduce((sum, g) => sum + Number(g.weightage || 0), 0);
  const newTotalWeightage = totalExistingWeightage + Number(req.body.weightage || 0);

  if (newTotalWeightage > 100) {
    res.status(400);
    throw new Error(`Total weightage would exceed 100%. Current: ${totalExistingWeightage}%, requested: +${req.body.weightage}%`);
  }

  const goal = await Goal.create({
    employeeId: req.user._id,
    title: req.body.title,
    description: req.body.description,
    thrustArea: req.body.thrustArea,
    uom: req.body.uom,
    target: req.body.target,
    weightage: req.body.weightage,
    status: 'draft',
  });

  await logAuditEvent({
    action: 'Created Goal Draft',
    user: req.user.name,
    role: req.user.role,
    entityType: 'Goal',
    entityId: goal._id.toString(),
    previousValue: 'None',
    newValue: goal.title,
  });

  const populated = await Goal.findById(goal._id).populate('employeeId', 'name email managerId department');
  res.status(201).json({ success: true, data: serializeGoal(populated) });
}));

router.put('/:id', protect, authorizeRoles('employee'), asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, employeeId: req.user._id });

  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }

  if (goal.locked || goal.status === 'approved') {
    res.status(400);
    throw new Error('Approved goals are locked and cannot be edited without admin intervention.');
  }

  const updatedWeightage = req.body.weightage !== undefined ? Number(req.body.weightage) : Number(goal.weightage || 0);
  if (Number.isNaN(updatedWeightage) || updatedWeightage < 10) {
    res.status(400);
    throw new Error('Minimum weightage per goal is 10%.');
  }

  const existingGoals = await Goal.find({ employeeId: req.user._id, _id: { $ne: goal._id } });
  const totalOtherWeightage = existingGoals.reduce((sum, item) => sum + Number(item.weightage || 0), 0);
  if (totalOtherWeightage + updatedWeightage > 100) {
    res.status(400);
    throw new Error(`Total weightage would exceed 100%. Current: ${totalOtherWeightage}%, requested: +${updatedWeightage}%`);
  }

  const previousValue = {
    title: goal.title,
    description: goal.description,
    thrustArea: goal.thrustArea,
    uom: goal.uom,
    target: goal.target,
    weightage: goal.weightage,
  };

  goal.title = req.body.title ?? goal.title;
  goal.description = req.body.description ?? goal.description;
  goal.thrustArea = req.body.thrustArea ?? goal.thrustArea;
  goal.uom = req.body.uom ?? goal.uom;
  goal.target = req.body.target ?? goal.target;
  goal.weightage = updatedWeightage;

  await goal.save();

  await logAuditEvent({
    action: 'Updated Goal Draft',
    user: req.user.name,
    role: req.user.role,
    entityType: 'Goal',
    entityId: goal._id.toString(),
    previousValue,
    newValue: {
      title: goal.title,
      description: goal.description,
      thrustArea: goal.thrustArea,
      uom: goal.uom,
      target: goal.target,
      weightage: goal.weightage,
    },
  });

  const populated = await Goal.findById(goal._id).populate('employeeId', 'name email managerId department');
  res.json({ success: true, data: serializeGoal(populated) });
}));

router.post('/submit', protect, authorizeRoles('employee'), asyncHandler(async (req, res) => {
  const goals = await Goal.find({ employeeId: req.user._id });
  const validationError = validateGoalSheet(goals);

  if (validationError) {
    res.status(400);
    throw new Error(validationError);
  }

  await Goal.updateMany(
    { employeeId: req.user._id, status: { $in: ['draft', 'returned'] } },
    { status: 'submitted', locked: false }
  );

  const managerId = req.user.managerId || (await User.findOne({ role: 'manager' }))?._id;
  await Approval.findOneAndUpdate(
    { employeeId: req.user._id, cycle: req.body.cycle || 'FY2026' },
    {
      employeeId: req.user._id,
      managerId,
      cycle: req.body.cycle || 'FY2026',
      goalsSnapshot: goals.map(goal => ({ goalId: goal._id, title: goal.title, weightage: goal.weightage })),
      status: 'Pending',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await logAuditEvent({
    action: 'Submitted Goal Sheet',
    user: req.user.name,
    role: req.user.role,
    entityType: 'Goal',
    entityId: req.user._id.toString(),
    previousValue: 'Draft',
    newValue: 'Submitted',
  });

  const updatedGoals = await Goal.find({ employeeId: req.user._id }).populate('employeeId', 'name email managerId department');
  res.json({ success: true, data: updatedGoals.map(serializeGoal) });
}));

router.post('/:id/checkins', protect, authorizeRoles('employee'), asyncHandler(async (req, res) => {
  // Enforce quarterly window
  if (!validateCheckInWindow()) {
    res.status(400);
    throw new Error(getCheckInWindowError());
  }

  const goal = await Goal.findOne({ _id: req.params.id, employeeId: req.user._id });
  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }

  if (!goal.locked && goal.status !== 'approved') {
    res.status(400);
    throw new Error('Only approved goals can receive check-ins.');
  }

  const progress = computeProgress(goal.uom, goal.target, req.body.actualAchievement);
  goal.actual = req.body.actualAchievement;
  goal.progress = progress;
  await goal.save();

  const checkin = await Checkin.create({
    goalId: goal._id,
    employeeId: req.user._id,
    quarter: req.body.quarter || 'Q1',
    year: req.body.year || new Date().getFullYear(),
    actualAchievement: req.body.actualAchievement,
    computedProgress: progress,
    employeeNotes: req.body.employeeNotes,
    status: req.body.status || 'On Track',
  });

  await logAuditEvent({
    action: 'Submitted Check-in',
    user: req.user.name,
    role: req.user.role,
    entityType: 'Check-in',
    entityId: checkin._id.toString(),
    previousValue: 'Pending',
    newValue: `${progress}%`,
  });

  const populated = await Goal.findById(goal._id).populate('employeeId', 'name email managerId department');
  res.json({ success: true, data: serializeGoal(populated) });
}));

// Admin endpoint to unlock a goal
router.put('/:id/unlock', protect, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id).populate('employeeId', 'name email _id');
  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }

  goal.locked = false;
  goal.status = 'submitted';
  await goal.save();

  // Notify employee about unlock
  await dispatchNotification({
    userId: goal.employeeId._id.toString(),
    type: 'reminder',
    title: 'Goal Unlocked',
    message: `Your goal "${goal.title}" has been unlocked for editing by an administrator.`,
    linkData: null,
  });

  await logAuditEvent({
    action: 'Unlocked Goal',
    user: req.user.name,
    role: req.user.role,
    entityType: 'Goal',
    entityId: goal._id.toString(),
    previousValue: 'Locked',
    newValue: 'Unlocked',
  });

  const populated = await Goal.findById(goal._id).populate('employeeId', 'name email managerId department');
  res.json({ success: true, data: serializeGoal(populated) });
}));

export default router;
