import express from 'express';
import { apiResponse } from '../../utils/responseFormatter.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authorizeRoles } from '../../middleware/role.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.put('/:id', protect, authorizeRoles('manager', 'admin'), asyncHandler(async (req, res) => {
  apiResponse(res, 200, 'Goal approved successfully', { goalId: req.params.id, status: 'approved' });
}));

export default router;
