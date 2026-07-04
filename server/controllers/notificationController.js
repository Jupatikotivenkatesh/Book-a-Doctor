const asyncHandler = require("express-async-handler");
const Notification = require("../models/Notification");

// ─── @desc    Get user's notifications
// ─── @route   GET /api/notifications
// ─── @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter = { userId: req.user._id };
  if (unreadOnly === "true") filter.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId: req.user._id, isRead: false }),
  ]);

  res.status(200).json({
    success: true,
    data: notifications,
    unreadCount,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// ─── @desc    Mark a notification as read
// ─── @route   PUT /api/notifications/:id/read
// ─── @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  if (notification.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: notification,
  });
});

// ─── @desc    Mark all notifications as read
// ─── @route   PUT /api/notifications/read-all
// ─── @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
});

// ─── @desc    Delete a notification
// ─── @route   DELETE /api/notifications/:id
// ─── @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  if (notification.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    message: "Notification deleted",
  });
});

// ─── @desc    Get unread notification count
// ─── @route   GET /api/notifications/unread-count
// ─── @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    userId: req.user._id,
    isRead: false,
  });

  res.status(200).json({ success: true, data: { count } });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};
