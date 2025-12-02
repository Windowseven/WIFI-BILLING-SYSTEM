const db = require('../config/db');
const { generateVoucherCode } = require('../utils/voucherUtils');


// Simulate Payment & Activate Voucher
exports.simulatePayment = async (req, res) => {
    try {
        const { voucher_id, user_id, amount } = req.body;

        // Check if voucher exists and is active
        const [vouchers] = await db.query("SELECT * FROM vouchers WHERE id=? AND status='active'", [voucher_id]);
        if (vouchers.length === 0) return res.status(404).json({ error: 'Voucher not found or inactive' });

        // Insert payment record
        await db.query(
            "INSERT INTO payments (user_id, voucher_id, amount, method, status) VALUES (?, ?, ?, 'manual', 'completed')",
            [user_id, voucher_id, amount]
        );

        // Activate voucher: create session
        const voucher = vouchers[0];
        const now = new Date();
        await db.query(
            "INSERT INTO sessions (user_id, voucher_id, start_time, status) VALUES (?, ?, ?, 'active')",
            [user_id, voucher_id, now]
        );

        // Optionally update user status to active
        await db.query("UPDATE users SET status='active' WHERE id=?", [user_id]);

        res.json({ message: 'Payment simulated and voucher activated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// physical payment controller

exports.createPhysicalPayment = async (req, res) => {
  try {
    const { plan_id, amount_paid, paid_by = 'customer' } = req.body;
    const adminId = req.user.id;

    // 1. Get plan details
    const [plan] = await db.query("SELECT * FROM plans WHERE id = ?", [plan_id]);
    if (!plan.length) {
      return res.status(404).json({ error: "Plan not found" });
    }

    // 2. Generate voucher
    const code = generateVoucherCode(12);
    const voucherData = {
      code,
      plan_id,
      status: 'active',
      device_limit: plan[0].device_limit,
      data_limit_mb: plan[0].data_limit_mb,
      duration_minutes: plan[0].duration_minutes
    };

    const [result] = await db.query(
      "INSERT INTO vouchers SET ?", voucherData
    );

    // 3. Log physical payment
    await db.query(
      "INSERT INTO physical_payments (voucher_id, plan_id, amount_paid, processed_by) VALUES (?, ?, ?, ?)",
      [result.insertId, plan_id, amount_paid, adminId]
    );

    // 4. Return voucher code
    res.json({
      message: "Physical payment recorded successfully",
      voucher_code: code,
      plan: plan[0],
      amount_paid
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};


