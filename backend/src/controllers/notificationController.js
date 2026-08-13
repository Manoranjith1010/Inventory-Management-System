const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");

const listNotifications = asyncHandler(async (req, res) => {
  const role = req.user.role;
  const items = await Notification.find({
    $or: [{ createdForRole: role }, { createdForRole: "admin" }],
  })
    .sort({ createdAt: -1 })
    .limit(100);

  res.status(200).json(items);
});

const markAsRead = asyncHandler(async (req, res) => {
  const item = await Notification.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true, runValidators: true }
  );

  if (!item) {
    return res.status(404).json({ message: "Notification not found" });
  }

  res.status(200).json(item);
});

module.exports = { listNotifications, markAsRead };
