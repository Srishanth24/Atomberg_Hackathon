import express from 'express';
import { apiResponse } from '../../utils/responseFormatter.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = express.Router();

router.post('/login', asyncHandler(async (req, res) => {
  // Mock login logic
  apiResponse(res, 200, 'Login successful', { token: 'mock-jwt-token', user: req.body.email });
}));

export default router;
