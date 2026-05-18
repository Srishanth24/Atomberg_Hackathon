import express from 'express';
import CycleSetting from '../../models/CycleSetting.js';
import { apiResponse } from '../../utils/responseFormatter.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { protect } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/role.js';

const router = express.Router();

const defaultSettings = {
  activeCycle: 'FY2026',
  phase: 'Goal Setting',
  isGoalSettingOpen: true,
  q1Window: 'July',
  q2Window: 'October',
  q3Window: 'January',
  q4Window: 'March-April',
};

router.get('/', protect, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const settings = await CycleSetting.findOne({}).sort({ updatedAt: -1 });

  if (!settings) {
    apiResponse(res, 200, 'Cycle settings fetched successfully', defaultSettings);
    return;
  }

  apiResponse(res, 200, 'Cycle settings fetched successfully', {
    activeCycle: settings.activeCycle,
    phase: settings.phase,
    isGoalSettingOpen: settings.isGoalSettingOpen,
    q1Window: settings.q1Window,
    q2Window: settings.q2Window,
    q3Window: settings.q3Window,
    q4Window: settings.q4Window,
  });
}));

router.put('/', protect, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const payload = {
    activeCycle: req.body.activeCycle || defaultSettings.activeCycle,
    phase: req.body.phase || defaultSettings.phase,
    isGoalSettingOpen: typeof req.body.isGoalSettingOpen === 'boolean' ? req.body.isGoalSettingOpen : defaultSettings.isGoalSettingOpen,
    q1Window: req.body.q1Window || defaultSettings.q1Window,
    q2Window: req.body.q2Window || defaultSettings.q2Window,
    q3Window: req.body.q3Window || defaultSettings.q3Window,
    q4Window: req.body.q4Window || defaultSettings.q4Window,
    updatedBy: req.user._id,
  };

  const settings = await CycleSetting.findOneAndUpdate({}, payload, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });

  apiResponse(res, 200, 'Cycle settings updated successfully', {
    activeCycle: settings.activeCycle,
    phase: settings.phase,
    isGoalSettingOpen: settings.isGoalSettingOpen,
    q1Window: settings.q1Window,
    q2Window: settings.q2Window,
    q3Window: settings.q3Window,
    q4Window: settings.q4Window,
  });
}));

export default router;