import express from 'express';
import Goal from '../../models/Goal.js';
import Approval from '../../models/Approval.js';
import { apiResponse } from '../../utils/responseFormatter.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authorizeRoles } from '../../middleware/role.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const [goals, approvals] = await Promise.all([
    Goal.find({}).populate('employeeId', 'name email managerId').populate('primaryOwnerId', 'name email').sort({ updatedAt: -1 }),
    Approval.find({}).populate('employeeId', 'name email managerId').populate('managerId', 'name email').sort({ updatedAt: -1 }),
  ]);

  const now = Date.now();

  const pendingApprovalEscalations = approvals
    .filter(approval => approval.status === 'Pending')
    .map((approval, index) => {
      const daysOverdue = Math.max(1, Math.ceil((now - new Date(approval.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
      const level = daysOverdue >= 8 ? 3 : daysOverdue >= 4 ? 2 : 1;
      return {
        id: `approval-${approval._id}`,
        employee: approval.employeeId?.name || 'Employee',
        manager: approval.managerId?.name || 'Manager',
        triggerType: 'Pending Approval',
        daysOverdue,
        level,
        status: level === 3 ? 'Escalated to HR' : level === 2 ? 'Pending Manager' : 'Employee Reminder',
        severity: level === 3 ? 'danger' : level === 2 ? 'warning' : 'info',
        sourceId: approval._id,
        createdAt: approval.createdAt,
      };
    });

  const overdueCheckinEscalations = goals
    .filter(goal => (goal.status === 'approved' || goal.status === 'locked') && (goal.actual === null || goal.actual === undefined || goal.actual === ''))
    .map((goal) => {
      const daysOverdue = Math.max(1, Math.ceil((now - new Date(goal.updatedAt || goal.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
      const level = daysOverdue >= 8 ? 3 : daysOverdue >= 4 ? 2 : 1;
      return {
        id: `checkin-${goal._id}`,
        employee: goal.employeeId?.name || 'Employee',
        manager: goal.employeeId?.managerId?.name || 'Manager',
        triggerType: 'Overdue Check-in',
        daysOverdue,
        level,
        status: level === 3 ? 'Escalated to HR' : level === 2 ? 'Pending Manager' : 'Employee Reminder',
        severity: level === 3 ? 'danger' : level === 2 ? 'warning' : 'info',
        sourceId: goal._id,
        createdAt: goal.createdAt,
      };
    });

  const missingGoalsEscalations = [];

  const data = [...pendingApprovalEscalations, ...overdueCheckinEscalations, ...missingGoalsEscalations]
    .sort((left, right) => right.daysOverdue - left.daysOverdue)
    .slice(0, 100);

  apiResponse(res, 200, 'Escalations fetched successfully', data);
}));

export default router;
