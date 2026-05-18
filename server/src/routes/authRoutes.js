import express from 'express';
import jwt from 'jsonwebtoken';
import { apiResponse } from '../../utils/responseFormatter.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import User from '../../models/User.js';

const router = express.Router();

const demoUsers = [
  { name: 'Peter Parker', email: 'peter.parker@goalsync.app', password: 'demo123!', role: 'employee', department: 'Engineering & Technology', managerAzureAdId: 'tony.stark@goalsync.app' },
  { name: 'Tony Stark', email: 'tony.stark@goalsync.app', password: 'demo123!', role: 'manager', department: 'Engineering & Technology' },
  { name: 'Admin HR', email: 'admin.hr@goalsync.app', password: 'demo123!', role: 'admin', department: 'HR' },
];

const ensureDemoUsers = async () => {
  const manager = await User.findOneAndUpdate(
    { email: 'tony.stark@goalsync.app' },
    demoUsers[1],
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await User.findOneAndUpdate(
    { email: 'peter.parker@goalsync.app' },
    { ...demoUsers[0], managerId: manager._id },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await User.findOneAndUpdate(
    { email: 'admin.hr@goalsync.app' },
    demoUsers[2],
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const buildToken = (user) => jwt.sign(
  { id: user._id, role: user.role, name: user.name, email: user.email },
  process.env.JWT_SECRET || 'fallback_secret',
  { expiresIn: '8h' }
);

const parseList = (value = '') => String(value)
  .split(',')
  .map(item => item.trim())
  .filter(Boolean);

const resolveRoleFromClaims = ({ roles = [], groups = [], email = '' }) => {
  const normalizedEmail = String(email).toLowerCase();

  if (Array.isArray(roles)) {
    const explicitRole = roles.find(role => ['admin', 'manager', 'employee'].includes(String(role).toLowerCase()));
    if (explicitRole) {
      return String(explicitRole).toLowerCase();
    }
  }

  const roleGroupMap = {
    admin: parseList(process.env.ENTRA_ADMIN_GROUP_IDS),
    manager: parseList(process.env.ENTRA_MANAGER_GROUP_IDS),
    employee: parseList(process.env.ENTRA_EMPLOYEE_GROUP_IDS),
  };

  if (groups.some(groupId => roleGroupMap.admin.includes(groupId))) return 'admin';
  if (groups.some(groupId => roleGroupMap.manager.includes(groupId))) return 'manager';
  if (groups.some(groupId => roleGroupMap.employee.includes(groupId))) return 'employee';

  if (normalizedEmail.includes('admin')) return 'admin';
  if (normalizedEmail.includes('manager')) return 'manager';
  return 'employee';
};

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  managerId: user.managerId,
  azureAdId: user.azureAdId,
  managerAzureAdId: user.managerAzureAdId,
});

router.post('/login', asyncHandler(async (req, res) => {
  await ensureDemoUsers();

  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() });

  if (!user || user.password !== password) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = buildToken(user);

  apiResponse(res, 200, 'Login successful', {
    token,
    user: serializeUser(user),
  });
}));

router.post('/entra', asyncHandler(async (req, res) => {
  const { azureAdId, email, name, department, role, tenantId, issuer, groups = [], roles = [] } = req.body;

  if (!azureAdId && !email) {
    res.status(400);
    throw new Error('Entra login requires an azureAdId or email claim');
  }

  const normalizedEmail = String(email || '').toLowerCase();
  const fallbackRole = ['employee', 'manager', 'admin'].includes(role)
    ? role
    : resolveRoleFromClaims({ roles, groups, email: normalizedEmail });

  const user = await User.findOneAndUpdate(
    azureAdId
      ? { azureAdId }
      : { email: normalizedEmail },
    {
      name: name || normalizedEmail.split('@')[0] || 'Entra User',
      email: normalizedEmail,
      azureAdId: azureAdId || normalizedEmail,
      tenantId,
      issuer,
      department: department || 'Engineering & Technology',
      role: fallbackRole,
      managerAzureAdId: req.body.managerAzureAdId || undefined,
      password: 'entra-sso',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const token = buildToken(user);

  apiResponse(res, 200, 'Entra login successful', {
    token,
    user: serializeUser(user),
  });
}));

export default router;
