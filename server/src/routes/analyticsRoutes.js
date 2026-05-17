import express from 'express';
import { apiResponse } from '../../utils/responseFormatter.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, asyncHandler(async (req, res) => {
  apiResponse(res, 200, 'Analytics data fetched successfully', {});
}));

export default router;
