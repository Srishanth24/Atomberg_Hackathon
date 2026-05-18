import express from 'express';
import User from '../../models/User.js';
import { apiResponse } from '../../utils/responseFormatter.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { protect } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/role.js';

const router = express.Router();

const defaultManagerAzureId = 'tony.stark@goalsync.app';

const buildSummary = (users) => {
  const totalUsers = users.length;
  const managers = users.filter(user => user.role === 'manager');
  const employees = users.filter(user => user.role === 'employee');
  const linkedEmployees = employees.filter(user => user.managerId);
  const unresolvedEmployees = employees.filter(user => !user.managerId);

  return {
    totalUsers,
    managers: managers.length,
    employees: employees.length,
    linkedEmployees: linkedEmployees.length,
    unresolvedEmployees: unresolvedEmployees.length,
  };
};

const resolveManagerLinks = async (users) => {
  const managerLookup = new Map(
    users
      .filter(user => user.azureAdId)
      .map(user => [user.azureAdId, user._id])
  );

  const fallbackManager = managerLookup.get(defaultManagerAzureId) || users.find(user => user.role === 'manager')?._id || null;

  const updateTasks = users.map(async (user) => {
    if (user.role !== 'employee') {
      return null;
    }

    const resolvedManagerId = user.managerAzureAdId
      ? managerLookup.get(user.managerAzureAdId) || fallbackManager
      : fallbackManager;

    if (!resolvedManagerId) {
      return null;
    }

    if (String(user.managerId || '') === String(resolvedManagerId)) {
      return null;
    }

    await User.updateOne({ _id: user._id }, { $set: { managerId: resolvedManagerId } });
    return user._id;
  });

  const updatedIds = (await Promise.all(updateTasks)).filter(Boolean);
  const refreshedUsers = await User.find({}).populate('managerId', 'name email azureAdId role').sort({ role: 1, name: 1 });

  return {
    updatedIds,
    users: refreshedUsers,
  };
};

router.get('/', protect, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const users = await User.find({}).populate('managerId', 'name email azureAdId role').sort({ role: 1, name: 1 });

  apiResponse(res, 200, 'Org hierarchy fetched successfully', {
    summary: buildSummary(users),
    users: users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      azureAdId: user.azureAdId,
      managerAzureAdId: user.managerAzureAdId,
      managerName: user.managerId?.name || null,
    })),
  });
}));

router.post('/sync', protect, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const incomingMembers = Array.isArray(req.body.members) ? req.body.members : [];

  if (incomingMembers.length > 0) {
    for (const member of incomingMembers) {
      await User.findOneAndUpdate(
        member.azureAdId ? { azureAdId: member.azureAdId } : { email: String(member.email || '').toLowerCase() },
        {
          name: member.name,
          email: String(member.email || '').toLowerCase(),
          role: member.role || 'employee',
          department: member.department,
          azureAdId: member.azureAdId || String(member.email || '').toLowerCase(),
          managerAzureAdId: member.managerAzureAdId,
          password: 'entra-sso',
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  }

  const { updatedIds, users } = await resolveManagerLinks(await User.find({}));

  apiResponse(res, 200, 'Org hierarchy synchronized successfully', {
    summary: buildSummary(users),
    updatedCount: updatedIds.length,
    users: users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      azureAdId: user.azureAdId,
      managerAzureAdId: user.managerAzureAdId,
      managerName: user.managerId?.name || null,
    })),
  });
}));

export default router;