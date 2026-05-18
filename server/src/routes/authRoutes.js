import express from 'express';
import jwt from 'jsonwebtoken';
import { apiResponse } from '../../utils/responseFormatter.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import User from '../../models/User.js';

const router = express.Router();

const demoUsers = [
  { name: 'Peter Parker', email: 'peter.parker@goalsync.app', password: 'demo123!', role: 'employee', department: 'Engineering & Technology' },
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

router.post('/login', asyncHandler(async (req, res) => {
  await ensureDemoUsers();

  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() });

  if (!user || user.password !== password) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '8h' }
  );

  apiResponse(res, 200, 'Login successful', {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      managerId: user.managerId,
    },
  });
}));

export default router;
