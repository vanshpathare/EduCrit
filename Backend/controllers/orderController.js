const Order = require("../models/Order");
const Item = require("../models/Item");
const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");

/**
 * @desc    Initiate Buy/Rent (Step 1: Generate & Send Pickup OTP to Buyer)
 */
module.exports.createOrder = async (req, res, next) => {
  try {
    const { itemId, type, amount } = req.body;

    // 🟢 Updated: Populate owner details immediately for the first email
    const item = await Item.findById(itemId).populate("owner", "name email");

    if (!item) return res.status(404).json({ message: "Item not found" });

    // Generate codes
    const pOTP = generateOTP();
    const rOTP = type === "rent" ? generateOTP() : null;

    const newOrder = await Order.create({
      user: req.user._id,
      seller: item.owner._id,
      item: item._id,
      // ADD SNAPSHOTS HERE
      itemTitle: item.title,
      itemImage: item.images?.[0]?.url || "",
      amount,
      deposit: item.rent?.deposit || "None",
      transactionType: type,
      pickupOTP: { code: pOTP },
      returnOTP: rOTP ? { code: rOTP } : undefined,
      status: "pending",
    });

    // 📧 EMAIL 1: Send Pickup OTP to the BUYER
    await sendEmail({
      to: req.user.email,
      subject: `Pickup OTP for ${item.title}`,
      text: `Your Pickup OTP is: ${pOTP}. Provide this to ${item.owner.name} ONLY when you physically receive the item. \n\nRequired Deposit: ${item.rent?.deposit || "None"}`,
    });

    res.status(201).json({
      message: "Order initiated. Pickup OTP sent to your email.",
      orderId: newOrder._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Pickup (Owner enters Buyer's OTP)
 */
module.exports.verifyPickup = async (req, res, next) => {
  try {
    const { otp } = req.body;
    // 🟢 Fixed: Must populate seller to get their email for the Return OTP email
    const order = await Order.findById(req.params.id).populate(
      "item user seller",
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    // 🔒 Security: Only the Seller (owner) should be calling this verification
    if (order.seller._id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized: Only the seller can verify pickup" });
    }

    if (order.pickupOTP.code !== otp) {
      return res.status(400).json({ message: "Invalid Pickup OTP" });
    }

    order.status = order.transactionType === "rent" ? "active" : "completed";
    order.pickupOTP.isVerified = true;
    await order.save();

    if (order.item) {
      // If it's a SALE, it's gone forever.
      // If it's a RENT, it's unavailable until returned.
      await Item.findByIdAndUpdate(order.item._id, { isAvailable: false });
    }

    // ADD THE BUYER CONFIRMATION HERE
    await sendEmail({
      to: order.user.email,
      subject: `Receipt - Handover Confirmed: ${order.item?.title || order.itemTitle}`,
      text: `Hi ${order.user.name}, the handover for "${order.item?.title || order.itemTitle}" has been confirmed by the seller. \n\nTransaction Type: ${order.transactionType.toUpperCase()} \nAmount Paid: ₹${order.amount} \n\nThank you for using EduCrit!`,
    });

    // 📧 EMAIL 2: If Renting, send Return OTP to the OWNER
    if (order.transactionType === "rent") {
      await sendEmail({
        to: order.seller.email, // Now works because of populate("seller")
        subject: `Return Handshake Code for ${order.item?.title || order.itemTitle || "Your Item"}`,
        text: `Item "${order.item?.title || order.itemTitle || "ordered item"}" handed over to ${order.user.name}. \n\nIMPORTANT: When they return the item to you, give them this Return OTP: ${order.returnOTP.code}.`,
      });
    } else {
      //  NEW: Sale Confirmation Email
      await sendEmail({
        to: order.seller.email,
        subject: `Success! Item Sold: ${order.item?.title || order.itemTitle}`,
        text: `Congratulations! Your item "${order.item?.title || order.itemTitle}" has been marked as SOLD to ${order.user.name}.\n\nThis item has been removed from the public listings. You can still view the transaction details in your History page.`,
      });
    }

    res.json({ message: "Pickup verified successfully", status: order.status });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Return (Buyer enters Return OTP provided by Seller)
 */
module.exports.verifyReturn = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    // 🔒 Security: Renter enters the code given by the owner
    if (order.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized: Only the renter can verify return" });
    }

    if (order.returnOTP.code !== otp) {
      return res.status(400).json({ message: "Invalid Return OTP" });
    }

    order.status = "completed";
    order.returnOTP.isVerified = true;
    await order.save();

    // NEW: Mark the Item as available again after return
    if (order.item && order.transactionType === "rent") {
      await Item.findByIdAndUpdate(order.item, { isAvailable: true });
    }

    res.json({ message: "Item returned and transaction completed!" });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend OTP based on order status
 */
module.exports.resendOrderOTP = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "item user seller",
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status === "pending") {
      // Resend Pickup OTP to Buyer
      await sendEmail({
        to: order.user.email,
        subject: `RE-SENT: Pickup OTP for ${order.item?.title || order.itemTitle || "Your Item"}`,
        text: `Your Pickup OTP is: ${order.pickupOTP.code}. Show this to the seller at meetup.`,
      });
    } else if (order.status === "active" && order.transactionType === "rent") {
      // Resend Return OTP to Seller
      await sendEmail({
        to: order.seller.email,
        subject: `RE-SENT: Return OTP for ${order.item?.title || order.itemTitle || "Your Item"}`,
        text: `Your Return OTP is: ${order.returnOTP.code}. Give this to the buyer when they return your item.`,
      });
    } else {
      return res
        .status(400)
        .json({ message: "OTP cannot be resent for this status" });
    }

    res.json({ message: "OTP has been re-sent to your registered email." });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get User Transaction History
 */
module.exports.getOrderHistory = async (req, res, next) => {
  try {
    // Only show pending orders created in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const history = await Order.find({
      $and: [
        // 1. Identity Check (Must be buyer OR seller)
        { $or: [{ user: req.user._id }, { seller: req.user._id }] },
        // 2. Status/Date Check
        {
          $or: [
            { status: { $in: ["active", "completed", "cancelled"] } },
            { status: "pending", createdAt: { $gte: sevenDaysAgo } },
          ],
        },
      ],
    })
      .populate({
        path: "item",
        select: "title images",
        options: { strictPopulate: false }, // Allows query to finish if item is null
      })
      .populate("user", "name email")
      .populate("seller", "name email")
      .sort("-createdAt")
      .lean();

    res.json(history);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a pending order
 */
module.exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // 🔒 Security: Only the buyer or seller can cancel
    const isBuyer = order.user.toString() === req.user._id.toString();
    const isSeller = order.seller.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // 🔒 Check Status: Can only cancel if it hasn't been picked up yet
    if (order.status !== "pending") {
      return res.status(400).json({
        message: "Cannot cancel an order that is already active or completed",
      });
    }

    order.status = "cancelled";
    await order.save();

    // If the order is cancelled, make the item available again
    if (order.item) {
      await Item.findByIdAndUpdate(order.item, { isAvailable: true });
    }

    res.json({ message: "Transaction cancelled successfully" });
  } catch (error) {
    next(error);
  }
};
