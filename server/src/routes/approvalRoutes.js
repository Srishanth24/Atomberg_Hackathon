import express from 'express';
import Approval from '../../models/Approval.js';
import Goal from '../../models/Goal.js';
import { apiResponse } from '../../utils/responseFormatter.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authorizeRoles } from '../../middleware/role.js';
import { protect } from '../../middleware/auth.js';
import { logAuditEvent } from '../../services/auditService.js';

const router = express.Router();

const serializeApproval = (approval) => ({
  id: approval._id,
  user: approval.employeeId?.name || 'Employee',
  employeeId: approval.employeeId?._id || approval.employeeId,
  managerId: approval.managerId?._id || approval.managerId,
  type: 'Goal Sheet',
  title: `${approval.goalsSnapshot.length} goals for ${approval.cycle}`,
  submittedAt: approval.createdAt,
  status: approval.status,
  history: [
    { action: 'Submitted', date: approval.createdAt },
    ...(approval.decisionDate ? [{ action: approval.status, date: approval.decisionDate }] : []),
  ],
  comment: approval.managerComment || '',
  weightage: approval.goalsSnapshot.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0),
  goals: approval.goalsSnapshot,
});

router.get('/', protect, authorizeRoles('manager', 'admin'), asyncHandler(async (req, res) => {
  const query = req.user.role === 'manager' ? { managerId: req.user._id } : {};
  const approvals = await Approval.find(query)
    .populate('employeeId', 'name email department')
    .populate('managerId', 'name email')
    .sort({ updatedAt: -1 });

  apiResponse(res, 200, 'Approvals fetched successfully', approvals.map(serializeApproval));
}));

router.put('/:id', protect, authorizeRoles('manager', 'admin'), asyncHandler(async (req, res) => {
  const { action, managerComment = '', goalEdits = [] } = req.body;
  const status = action === 'approve' ? 'Approved' : action === 'return' ? 'Returned' : 'Rejected';

  const approval = await Approval.findById(req.params.id);
  if (!approval) {
    res.status(404);
    throw new Error('Approval not found');
  }

  for (const edit of goalEdits) {
    await Goal.updateOne(
      { _id: edit.goalId, locked: { $ne: true } },
      { $set: { target: edit.target, weightage: edit.weightage } }
    );
  }

  approval.status = status;
  approval.managerComment = managerComment;
  approval.decisionDate = new Date();
  await approval.save();

  const goalStatus = status === 'Approved' ? 'locked' : 'returned';
  await Goal.updateMany(
    { employeeId: approval.employeeId, status: 'submitted' },
    { status: goalStatus, locked: status === 'Approved', managerComment }
  );

  await logAuditEvent({
    action: status === 'Approved' ? 'Approved Goal Sheet' : 'Returned Goal Sheet',
    user: req.user.name,
    role: req.user.role,
    entityType: 'Approval',
    entityId: approval._id.toString(),
    previousValue: 'Pending',
    newValue: status,
  });

  const populated = await Approval.findById(approval._id)
    .populate('employeeId', 'name email department')
    .populate('managerId', 'name email');

  apiResponse(res, 200, 'Approval updated successfully', serializeApproval(populated));
}));

export default router;
