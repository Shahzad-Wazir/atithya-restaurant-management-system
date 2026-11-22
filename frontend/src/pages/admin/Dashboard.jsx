import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { getDashboardStats } from "../../services/userService";
import Loading from "../../components/Loading";

const getStatusBadge = (status) => {
  if (["Delivered", "Served", "Confirmed", "Completed"].includes(status)) {
    return "bg-forest-soft text-forest";
  }
  if (["Pending", "Preparing", "Ready", "Out for Delivery", "Seated"].includes(status)) {
    return "bg-warning-soft text-[#A36D14]";
  }
  if (["Cancelled", "No-Show"].includes(status)) {
    return "bg-danger-soft text-danger";
  }
  return "bg-ivory text-brown";
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredBarIdx, setHoveredBarIdx] = useState(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Loading Atithya enterprise analytics..." />;
  if (!stats) return <p className="text-danger">Failed to load dashboard analytics.</p>;

  const categoryData = Object.entries(stats.categories || {}).map(([name, count]) => ({
    name,
    count,
  }));

  // Exact 6 KPI cards with Pure White background & specified number/icon accent colors
  const kpis = [
    {
      label: "Total Revenue",
      value: `₹${(stats.totalRevenue || 0).toLocaleString("en-IN")}`,
      sub: `Today: ₹${(stats.todayRevenue || 0).toLocaleString("en-IN")}`,
      accent: "#3D5140",
      icon: "₹",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders || 0,
      sub: `${stats.activeOrders || 0} active in kitchen`,
      accent: "#B94E2D",
      icon: "🧾",
    },
    {
      label: "Reservations",
      value: stats.totalReservations || 0,
      sub: `${stats.todayReservations || 0} booked today`,
      accent: "#C49A45",
      icon: "📅",
    },
    {
      label: "Dining Floor",
      value: `${stats.occupiedTables || 0} / ${stats.totalTables || 0}`,
      sub: "Tables occupied now",
      accent: "#315B75",
      icon: "🪑",
    },
    {
      label: "Menu Catalog",
      value: `${stats.availableMenuItems || 0} / ${stats.totalMenuItems || 0}`,
      sub: "Dishes available live",
      accent: "#7654A3",
      icon: "🍽️",
    },
    {
      label: "Registered Guests",
      value: stats.totalUsers || 0,
      sub: `${stats.pendingInquiries || 0} new inquiries`,
      accent: "#29201A",
      icon: "👥",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brown">
            Atithya Operations Overview
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Real-time revenue, live orders, table reservations, and kitchen performance
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {/* Primary Admin Button: Espresso with white text */}
          <Link
            to="/admin/orders"
            className="px-4 py-2.5 rounded-xl bg-espresso text-white text-xs font-semibold hover:bg-brown transition shadow-xs"
          >
            Manage Orders
          </Link>
          {/* Secondary Admin Button: Ivory with dark text */}
          <Link
            to="/admin/billing"
            className="px-4 py-2.5 rounded-xl bg-ivory border border-borderWarm text-brown text-xs font-semibold hover:border-gold transition"
          >
            Sales PDF &amp; Hero
          </Link>
          <Link
            to="/kitchen"
            className="px-4 py-2.5 rounded-xl bg-white border border-gold text-gold-dark text-xs font-semibold hover:bg-gold hover:text-espresso transition"
          >
            Kitchen Display
          </Link>
        </div>
      </div>

      {/* 6 Executive White KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="bg-white rounded-2xl p-4 border border-borderWarm shadow-2xs hover:shadow-soft transition"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                {k.label}
              </p>
              <span className="text-sm font-bold" style={{ color: k.accent }}>
                {k.icon}
              </span>
            </div>
            <p className="text-2xl font-bold mt-2 tabular-nums" style={{ color: k.accent }}>
              {k.value}
            </p>
            <p className="text-[11px] text-muted mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart — Darker Gold #B58A35, #EAE3D9 grid, #81766B labels */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-borderWarm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-bold text-brown">7-Day Revenue Trend (₹)</h2>
            <span className="text-xs font-semibold text-gold-dark">Live Data</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.salesTrend || []}>
                <defs>
                  <linearGradient id="atithyaGoldFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B58A35" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#B58A35" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE3D9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#81766B" }} axisLine={{ stroke: "#EAE3D9" }} />
                <YAxis tick={{ fontSize: 11, fill: "#81766B" }} axisLine={{ stroke: "#EAE3D9" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    borderColor: "#EAE3D9",
                    fontSize: "12px",
                  }}
                  formatter={(val) => [`₹${val}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#B58A35"
                  strokeWidth={2.5}
                  fill="url(#atithyaGoldFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Menu Category Chart — Dark Brown bars (#29201A) with Champagne Gold (#C49A45) on hover */}
        <div className="bg-white rounded-2xl p-6 border border-borderWarm">
          <h2 className="text-lg font-serif font-bold text-brown mb-4">Menu by Category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ left: 10 }}
                onMouseLeave={() => setHoveredBarIdx(null)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE3D9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#81766B" }} axisLine={{ stroke: "#EAE3D9" }} />
                <YAxis type="category" dataKey="name" width={88} tick={{ fontSize: 11, fill: "#29201A" }} axisLine={{ stroke: "#EAE3D9" }} />
                <Tooltip
                  cursor={{ fill: "rgba(247, 242, 233, 0.55)" }}
                  contentStyle={{
                    borderRadius: "12px",
                    borderColor: "#EAE3D9",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[0, 6, 6, 0]}
                  onMouseEnter={(_, idx) => setHoveredBarIdx(idx)}
                >
                  {categoryData.map((_, idx) => (
                    <Cell
                      key={`bar-${idx}`}
                      fill={hoveredBarIdx === idx ? "#C49A45" : "#29201A"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Dishes + Recent Orders + Recent Reservations */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-borderWarm">
          <h2 className="text-lg font-serif font-bold text-brown mb-4">Top-Selling Dishes</h2>
          {!stats.topDishes?.length ? (
            <p className="text-xs text-muted">No sales data yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.topDishes.map((d, idx) => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-ivory border border-gold/40 text-brown text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-brown truncate">{d.name}</span>
                  </div>
                  <div className="text-right shrink-0 ml-2 tabular-nums">
                    <p className="font-bold text-forest">₹{d.revenue}</p>
                    <p className="text-[11px] text-muted">{d.quantitySold} sold</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-borderWarm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-bold text-brown">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-primary font-semibold hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {(stats.recentOrders || []).map((o) => (
              <div
                key={o._id}
                className="flex items-center justify-between gap-2 text-xs pb-2.5 border-b border-borderWarm last:border-none"
              >
                <div className="min-w-0">
                  <p className="font-mono font-bold text-brown truncate">{o.orderNumber}</p>
                  <p className="text-muted truncate">
                    {o.customerName} · {o.orderType}
                  </p>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <p className="font-bold text-forest tabular-nums">₹{o.totalAmount}</p>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getStatusBadge(
                      o.status
                    )}`}
                  >
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-borderWarm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-bold text-brown">Latest Reservations</h2>
            <Link to="/admin/reservations" className="text-xs text-primary font-semibold hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {(stats.recentReservations || []).map((r) => (
              <div
                key={r._id}
                className="flex items-center justify-between gap-2 text-xs pb-2.5 border-b border-borderWarm last:border-none"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-brown truncate">{r.guestName}</p>
                  <p className="text-muted">
                    {r.date} · {r.timeSlot} · {r.partySize}p
                  </p>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <p className="font-mono font-bold text-brown">{r.table?.tableNumber || "-"}</p>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getStatusBadge(
                      r.status
                    )}`}
                  >
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}