import express from 'express';
import Goal from '../../models/Goal.js';
import AuditLog from '../../models/AuditLog.js';
import { apiResponse } from '../../utils/responseFormatter.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { protect } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/role.js';

const router = express.Router();

router.get('/achievement', protect, authorizeRoles('manager', 'admin'), asyncHandler(async (req, res) => {
  const goals = await Goal.find({})
    .populate('employeeId', 'name email department')
    .sort({ updatedAt: -1 });

  apiResponse(res, 200, 'Achievement report generated successfully', goals.map(goal => ({
    employee: goal.employeeId?.name,
    email: goal.employeeId?.email,
    department: goal.employeeId?.department,
    goalTitle: goal.title,
    thrustArea: goal.thrustArea,
    plannedTarget: goal.target,
    actualAchievement: goal.actual ?? '',
    uom: goal.uom,
    progress: goal.progress,
    status: goal.status,
    weightage: goal.weightage,
  })));
}));

router.get('/audit', protect, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const logs = await AuditLog.find({}).sort({ timestamp: -1 }).limit(200);
  apiResponse(res, 200, 'Audit logs fetched successfully', logs.map(log => ({
    id: log._id,
    action: log.action,
    user: log.user,
    role: log.role,
    entityType: log.entityType,
    previousValue: log.previousValue,
    updatedValue: log.newValue,
    timestamp: log.timestamp,
  })));
}));

router.get('/export', protect, authorizeRoles('manager', 'admin'), asyncHandler(async (req, res) => {
  const goals = await Goal.find({}).populate('employeeId', 'name email department');
  apiResponse(res, 200, 'Report generated successfully', goals);
}));

export default router;
