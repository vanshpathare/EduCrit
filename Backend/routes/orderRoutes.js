const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const protect = require("../middlewares/authMiddleware");

// 1. Create a new Buy/Rent request
// POST /api/orders
router.post("/", protect, orderController.createOrder);

// 2. Get the logged-in user's history (Bought, Sold, Rented)
// GET /api/orders/history/me
router.get("/history/me", protect, orderController.getOrderHistory);

// 3. Verify the Pickup (Handshake Phase 1)
// POST /api/orders/:id/verify-pickup
router.post("/:id/verify-pickup", protect, orderController.verifyPickup);

// 4. Verify the Return (Handshake Phase 2 - Rental Only)
// POST /api/orders/:id/verify-return
router.post("/:id/verify-return", protect, orderController.verifyReturn);

// 5. Resend OTP (In case email is delayed)
// POST /api/orders/:id/resend-otp
router.post("/:id/resend-otp", protect, orderController.resendOrderOTP);

router.delete("/:id/cancel", protect, orderController.cancelOrder);

module.exports = router;
