const User = require("../models/user.model");
const MenuItem = require("../models/menuItem.model");
const Order = require("../models/order.model");
const Reservation = require("../models/reservation.model");
const Table = require("../models/table.model");
const ContactInquiry = require("../models/contactInquiry.model");

// @desc   Get comprehensive industrial admin dashboard analytics
// @route  GET /api/dashboard
exports.getStats = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalMenuItems,
      availableMenuItems,
      totalUsers,
      totalOrders,
      activeOrders,
      totalReservations,
      todayReservations,
      totalTables,
      occupiedTables,
      pendingInquiries,
      revenueAgg,
      todayRevenueAgg,
      categoryAgg,
      orderStatusAgg,
      salesTrendAgg,
      topDishesAgg,
      recentOrders,
      recentReservations,
    ] = await Promise.all([
      MenuItem.countDocuments(),
      MenuItem.countDocuments({ availability: true }),
      User.countDocuments({ role: "user" }),
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ["Pending", "Confirmed", "Preparing", "Ready", "Out for Delivery"] } }),
      Reservation.countDocuments(),
      Reservation.countDocuments({ date: todayStr, status: { $ne: "Cancelled" } }),
      Table.countDocuments({ isActive: true }),
      Table.countDocuments({ status: "Occupied" }),
      ContactInquiry.countDocuments({ status: "New" }),
      Order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: "Cancelled" }, createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
      ]),
      MenuItem.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { status: { $ne: "Cancelled" }, createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.name",
            quantitySold: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
        { $sort: { quantitySold: -1 } },
        { $limit: 5 },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(6),
      Reservation.find()
        .populate("table", "tableNumber zone")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    // Build continuous 7-day trend array
    const trendMap = new Map(salesTrendAgg.map((d) => [d._id, d]));
    const salesTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      const entry = trendMap.get(key);
      salesTrend.push({
        date: label,
        revenue: entry ? entry.revenue : 0,
        orders: entry ? entry.orders : 0,
      });
    }

    const categories = {};
    categoryAgg.forEach((c) => {
      categories[c._id] = c.count;
    });

    const orderStatusBreakdown = orderStatusAgg.map((s) => ({
      status: s._id,
      count: s.count,
    }));

    return res.json({
      totalRevenue: revenueAgg[0]?.total || 0,
      todayRevenue: todayRevenueAgg[0]?.total || 0,
      todayOrders: todayRevenueAgg[0]?.count || 0,
      totalOrders,
      activeOrders,
      totalMenuItems,
      availableMenuItems,
      totalUsers,
      totalReservations,
      todayReservations,
      totalTables,
      occupiedTables,
      pendingInquiries,
      categories,
      orderStatusBreakdown,
      salesTrend,
      topDishes: topDishesAgg.map((d) => ({
        name: d._id,
        quantitySold: d.quantitySold,
        revenue: d.revenue,
      })),
      recentOrders,
      recentReservations,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};