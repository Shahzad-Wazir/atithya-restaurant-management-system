import { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus } from "../../services/orderService";
import { useToast } from "../../context/ToastContext";
import Loading from "../../components/Loading";

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Out for Delivery",
  "Served",
  "Delivered",
  "Cancelled",
];

export default function Orders() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");

  const fetchOrders = () => {
    setLoading(true);
    getAllOrders({
      status: statusFilter,
      orderType: typeFilter,
      search: search.trim() || undefined,
    })
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(fetchOrders, 200);
    return () => clearTimeout(t);
  }, [statusFilter, typeFilter, search]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateOrderStatus(id, { status });
      addToast(`Order updated to ${status}`);
      fetchOrders();
    } catch {
      addToast("Could not update order", "error");
    }
  };

  const handlePaymentToggle = async (order) => {
    const nextPayment = order.paymentStatus === "Paid" ? "Pending" : "Paid";
    try {
      await updateOrderStatus(order._id, { paymentStatus: nextPayment });
      addToast(`Payment marked ${nextPayment}`);
      fetchOrders();
    } catch {
      addToast("Could not update payment status", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink">Live Orders Manager</h1>
          <p className="text-xs text-stone-500">Track, update, and reconcile all Dine-In, Takeaway, and Delivery orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold hover:border-primary"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order #, guest, phone, table..."
          className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-stone-200 text-sm outline-none"
        >
          <option value="All">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-stone-200 text-sm outline-none"
        >
          <option value="All">All Modes</option>
          <option value="Delivery">Delivery</option>
          <option value="Dine-In">Dine-In</option>
          <option value="Takeaway">Takeaway</option>
        </select>
      </div>

      {loading ? (
        <Loading text="Loading orders..." />
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 text-sm text-stone-500">
          No matching orders found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200/80 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-500 border-b border-stone-200">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Guest &amp; Mode</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-stone-50/70">
                  <td className="px-4 py-3.5 align-top">
                    <p className="font-mono font-bold text-xs text-ink">{order.orderNumber}</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <p className="font-semibold text-ink">{order.customerName}</p>
                    <p className="text-xs text-stone-500">{order.customerPhone}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-stone-100 text-[11px] font-medium">
                      {order.orderType} {order.tableNumber && `· ${order.tableNumber}`}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 align-top text-xs text-stone-600 max-w-xs">
                    {order.items.map((it, i) => (
                      <div key={i}>
                        {it.quantity}× {it.name}
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3.5 align-top font-bold text-ink">
                    ₹{order.totalAmount}
                    {order.couponCode && (
                      <p className="text-[10px] font-mono text-emerald-600">{order.couponCode}</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <p className="text-xs text-stone-600">{order.paymentMethod}</p>
                    <button
                      onClick={() => handlePaymentToggle(order)}
                      className={`mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        order.paymentStatus === "Paid"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {order.paymentStatus}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold bg-white outline-none focus:border-primary"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
