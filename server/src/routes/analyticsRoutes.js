import express from 'express';
import Goal from '../../models/Goal.js';
import Approval from '../../models/Approval.js';
import { apiResponse } from '../../utils/responseFormatter.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, asyncHandler(async (req, res) => {
  const [goals, approvals] = await Promise.all([
    Goal.find({}).populate('employeeId', 'name department managerId').sort({ updatedAt: -1 }),
    Approval.find({}).populate('employeeId', 'name department').populate('managerId', 'name department').sort({ updatedAt: -1 }),
  ]);

  const summary = {
    totalGoals: goals.length,
    lockedGoals: goals.filter(goal => goal.locked || goal.status === 'locked' || goal.status === 'approved').length,
    pendingApprovals: approvals.filter(approval => approval.status === 'Pending').length,
    completedGoals: goals.filter(goal => Number(goal.progress) >= 100).length,
    averageProgress: goals.length ? Math.round(goals.reduce((sum, goal) => sum + Number(goal.progress || 0), 0) / goals.length) : 0,
  };

  const statusCounts = goals.reduce((accumulator, goal) => {
    const status = goal.status === 'locked' || goal.status === 'approved' ? 'Approved' : goal.status === 'returned' ? 'Returned' : goal.status === 'submitted' ? 'Submitted' : 'Draft';
    accumulator[status] = (accumulator[status] || 0) + 1;
    return accumulator;
  }, {});

  const thrustCounts = goals.reduce((accumulator, goal) => {
    const key = goal.thrustArea || 'Unassigned';
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  const monthlyProgress = goals.reduce((accumulator, goal) => {
    const month = new Date(goal.updatedAt || goal.createdAt).toLocaleString('en-US', { month: 'short' });
    const entry = accumulator.get(month) || { name: month, completed: 0, progress: 0, count: 0 };
    entry.completed += Number(goal.progress) >= 100 ? 1 : 0;
    entry.progress += Number(goal.progress || 0);
    entry.count += 1;
    accumulator.set(month, entry);
    return accumulator;
  }, new Map());

  const managerStats = approvals.reduce((accumulator, approval) => {
    const managerName = approval.managerId?.name || 'Unassigned Manager';
    const entry = accumulator.get(managerName) || { name: managerName, approvals: 0, approved: 0, totalDelayDays: 0, decisionCount: 0 };
    entry.approvals += 1;
    if (approval.status === 'Approved') entry.approved += 1;
    if (approval.decisionDate) {
      const delayDays = (new Date(approval.decisionDate).getTime() - new Date(approval.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      entry.totalDelayDays += Math.max(delayDays, 0);
      entry.decisionCount += 1;
    }
    accumulator.set(managerName, entry);
    return accumulator;
  }, new Map());

  const analytics = {
    summary,
    statusBreakdown: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
    thrustBreakdown: Object.entries(thrustCounts).map(([name, value], index) => ({
      name,
      value,
      color: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#14b8a6'][index % 6],
    })),
    monthlyProgress: Array.from(monthlyProgress.values())
      .sort((left, right) => left.name.localeCompare(right.name))
      .map(item => ({
        name: item.name,
        completed: item.completed,
        progress: item.count ? Math.round(item.progress / item.count) : 0,
      })),
    managerEffectiveness: Array.from(managerStats.values())
      .map(item => ({
        name: item.name,
        teamSize: item.approvals,
        avgDecisionDays: item.decisionCount ? Number((item.totalDelayDays / item.decisionCount).toFixed(1)) : 0,
        approvalRate: item.approvals ? Math.round((item.approved / item.approvals) * 100) : 0,
        effectiveness: item.approvals ? Math.round((item.approved / item.approvals) * 100) - Math.round(item.decisionCount ? (item.totalDelayDays / item.decisionCount) * 5 : 0) : 0,
      }))
      .sort((left, right) => right.effectiveness - left.effectiveness),
  };

  apiResponse(res, 200, 'Analytics data fetched successfully', analytics);
}));

export default router;
