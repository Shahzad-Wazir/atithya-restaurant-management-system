const BillingConfig = require("../models/billingConfig.model");
const Order = require("../models/order.model");

// @desc   Get live billing, charges & hero showcase config (Public)
// @route  GET /api/billing/config
exports.getBillingConfig = async (req, res) => {
  try {
    const config = await BillingConfig.getActiveConfig();
    return res.json(config);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Update billing, charges & hero showcase config (Admin)
// @route  PUT /api/billing/config
exports.updateBillingConfig = async (req, res) => {
  try {
    const config = await BillingConfig.getActiveConfig();
    const {
      legalName,
      gstin,
      invoiceAddress,
      heroShowcase,
      gstRate,
      deliveryFee,
      freeDeliveryAbove,
      packagingFee,
      convenienceFeeType,
      convenienceFeeValue,
      dineInServiceChargePercent,
      customCharges,
    } = req.body;

    if (legalName !== undefined) config.legalName = String(legalName).trim();
    if (gstin !== undefined) config.gstin = String(gstin).trim().toUpperCase();
    if (invoiceAddress !== undefined) config.invoiceAddress = String(invoiceAddress).trim();

    if (heroShowcase && typeof heroShowcase === "object") {
      config.heroShowcase = {
        badge:
          heroShowcase.badge !== undefined
            ? String(heroShowcase.badge).trim()
            : config.heroShowcase?.badge || "Chef's Signature",
        title:
          heroShowcase.title !== undefined
            ? String(heroShowcase.title).trim()
            : config.heroShowcase?.title || "24-Hr Smoked Dal Makhani",
        imageUrl:
          heroShowcase.imageUrl !== undefined
            ? String(heroShowcase.imageUrl).trim()
            : config.heroShowcase?.imageUrl || "",
      };
    }

    if (gstRate !== undefined) config.gstRate = Math.max(0, Math.min(40, Number(gstRate) || 0));
    if (deliveryFee !== undefined) config.deliveryFee = Math.max(0, Number(deliveryFee) || 0);
    if (freeDeliveryAbove !== undefined)
      config.freeDeliveryAbove = Math.max(0, Number(freeDeliveryAbove) || 0);
    if (packagingFee !== undefined) config.packagingFee = Math.max(0, Number(packagingFee) || 0);
    if (convenienceFeeType && ["flat", "percentage"].includes(convenienceFeeType)) {
      config.convenienceFeeType = convenienceFeeType;
    }
    if (convenienceFeeValue !== undefined) {
      config.convenienceFeeValue = Math.max(0, Number(convenienceFeeValue) || 0);
    }
    if (dineInServiceChargePercent !== undefined) {
      config.dineInServiceChargePercent = Math.max(
        0,
        Math.min(25, Number(dineInServiceChargePercent) || 0)
      );
    }

    if (Array.isArray(customCharges)) {
      config.customCharges = customCharges
        .filter((c) => c && c.name && String(c.name).trim())
        .map((c) => ({
          name: String(c.name).trim(),
          type: c.type === "percentage" ? "percentage" : "flat",
          value: Math.max(0, Number(c.value) || 0),
          applyTo: ["All", "Delivery", "Dine-In", "Takeaway"].includes(c.applyTo)
            ? c.applyTo
            : "All",
          isActive: c.isActive !== false,
        }));
    }

    await config.save();
    return res.json(config);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Get filtered sales report for Admin PDF/CSV download
// @route  GET /api/billing/sales-report
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, orderType, paymentMethod, includeCancelled } = req.query;

    const filter = {};
    if (includeCancelled !== "true") {
      filter.status = { $ne: "Cancelled" };
    }
    if (orderType && orderType !== "All") {
      filter.orderType = orderType;
    }
    if (paymentMethod && paymentMethod !== "All") {
      filter.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        const start = new Date(`${startDate}T00:00:00.000Z`);
        if (!isNaN(start.getTime())) filter.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(`${endDate}T23:59:59.999Z`);
        if (!isNaN(end.getTime())) filter.createdAt.$lte = end;
      }
    }

    const [orders, config] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }),
      BillingConfig.getActiveConfig(),
    ]);

    const summary = {
      orderCount: orders.length,
      grossSubtotal: 0,
      totalDiscount: 0,
      totalTax: 0,
      totalDeliveryFee: 0,
      totalPackagingFee: 0,
      totalConvenienceFee: 0,
      totalServiceCharge: 0,
      totalCustomCharges: 0,
      netRevenue: 0,
      paidRevenue: 0,
      pendingRevenue: 0,
      byPaymentMethod: {},
      byOrderType: {},
    };

    for (const o of orders) {
      const customSum = (o.customCharges || []).reduce((acc, c) => acc + (c.amount || 0), 0);
      summary.grossSubtotal += o.subtotal || 0;
      summary.totalDiscount += o.discount || 0;
      summary.totalTax += o.tax || 0;
      summary.totalDeliveryFee += o.deliveryFee || 0;
      summary.totalPackagingFee += o.packagingFee || 0;
      summary.totalConvenienceFee += o.convenienceFee || 0;
      summary.totalServiceCharge += o.serviceCharge || 0;
      summary.totalCustomCharges += customSum;
      summary.netRevenue += o.totalAmount || 0;

      if (o.paymentStatus === "Paid") summary.paidRevenue += o.totalAmount || 0;
      else summary.pendingRevenue += o.totalAmount || 0;

      summary.byPaymentMethod[o.paymentMethod] =
        (summary.byPaymentMethod[o.paymentMethod] || 0) + (o.totalAmount || 0);
      summary.byOrderType[o.orderType] =
        (summary.byOrderType[o.orderType] || 0) + (o.totalAmount || 0);
    }

    return res.json({
      period: {
        startDate: startDate || "All Time",
        endDate: endDate || "Present",
      },
      business: {
        legalName: config.legalName,
        gstin: config.gstin,
        invoiceAddress: config.invoiceAddress,
      },
      summary,
      orders,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
