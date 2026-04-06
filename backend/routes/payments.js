const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");

function getRazorpayOrNull() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

// Create order — body.amount must be in paise (integer), e.g. ₹100 => 10000
router.post("/create-order", async (req, res) => {
  try {
    const razorpay = getRazorpayOrNull();
    if (!razorpay) {
      return res.status(503).json({
        error:
          "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env and restart the server.",
      });
    }

    const amountPaise = Math.round(Number(req.body.amount));
    if (!Number.isFinite(amountPaise) || amountPaise < 100) {
      return res.status(400).json({
        error:
          "Invalid amount. Send amount in paise (integer). Minimum is 100 (₹1).",
      });
    }

    const options = {
      amount: amountPaise,
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Razorpay create-order:", err);
    const msg =
      err && err.error && err.error.description
        ? err.error.description
        : err.message || "Error creating order";
    res.status(500).json({ error: msg });
  }
});

// Verify payment
router.post("/verify-payment", (req, res) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return res.status(503).json({
      ok: false,
      error: "Razorpay key secret not configured.",
    });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      ok: false,
      error: "Missing razorpay_order_id, razorpay_payment_id, or razorpay_signature",
    });
  }

  const generated_signature = crypto
    .createHmac("sha256", keySecret)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature === razorpay_signature) {
    // TODO: mark order as paid in DB
    return res.json({ ok: true, message: "Payment Verified" });
  }
  res.status(400).json({ ok: false, error: "Invalid Payment" });
});

module.exports = router;
