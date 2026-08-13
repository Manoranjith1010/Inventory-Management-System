const express = require("express");
const { listNotifications, markAsRead } = require("../controllers/notificationController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", listNotifications);
router.patch("/:id/read", markAsRead);

module.exports = router;
