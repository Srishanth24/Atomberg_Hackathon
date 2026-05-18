import express from 'express';
import Notification from '../../models/Notification.js';
import { apiResponse } from '../../utils/responseFormatter.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', protect, asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);

    apiResponse(res, 200, 'Notifications fetched successfully', notifications.map(n => ({
        id: n._id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt,
        linkData: n.linkData,
    })));
}));

router.put('/:id/read', protect, asyncHandler(async (req, res) => {
    const notification = await Notification.findByIdAndUpdate(
        req.params.id,
        { isRead: true },
        { new: true }
    );

    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    apiResponse(res, 200, 'Notification marked as read', notification);
}));

router.put('/read-all', protect, asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { userId: req.user._id, isRead: false },
        { isRead: true }
    );

    apiResponse(res, 200, 'All notifications marked as read', {});
}));

router.delete('/:id', protect, asyncHandler(async (req, res) => {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    apiResponse(res, 200, 'Notification deleted', {});
}));

export default router;
