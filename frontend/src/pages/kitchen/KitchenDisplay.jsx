import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getKitchenQueue, updateOrderStatus } from "../../services/orderService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import AtithyaLogo from "../../components/AtithyaLogo";

const NEXT_STATUS = {
  Pending: { label: "Confirm Ticket", next: "Confirmed", color: "bg-blue-600 hover:bg-blue-700" },
  Confirmed: { label: "Start Cooking", next: "Preparing", color: "bg-amber-600 hover:bg-amber-700" },
  Preparing: { label: "Mark Ready", next: "Ready", color: "bg-emerald-600 hover:bg-emerald-700" },
  Ready: { label: "Hand Off / Served", next: "Served", color: "bg-stone-700 hover:bg-stone-600" },
};

export default function KitchenDisplay() {
  const { user, logout, isAdmin } = useAuth();
  const { addToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadQueue = () => {
    getKitchenQueue()
      .then((data) => {
        setTickets(data);
        setLastUpdated(new Date());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 10000); // Live 10s KDS auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleAdvance = async (ticket) => {
    const action = NEXT_STATUS[ticket.status];
    if (!action) return;
    const targetStatus =
      action.next === "Served" && ticket.orderType === "Delivery"
        ? "Out for Delivery"
        : action.next;
    try {
      await updateOrderStatus(ticket._id, { status: targetStatus });
      addToast(`${ticket.orderNumber} → ${targetStatus}`);
      loadQueue();
    } catch {
      addToast("Could not update ticket status", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0a09] text-white flex flex-col">
      {/* KDS Top Bar */}
      <header className="px-6 py-4 bg-stone-950 border-b border-stone-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <AtithyaLogo theme="dark" size="sm" />
          <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-widest">
            Kitchen Display System (KDS)
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-stone-400">
            Auto-syncing · Last: {lastUpdated.toLocaleTimeString("en-IN")}
          </span>
          <button
            onClick={loadQueue}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 font-semibold"
          >
            ↻ Refresh
          </button>
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="px-3 py-1.5 rounded-lg bg-primary text-white font-semibold"
            >
              Admin Console
            </Link>
          )}
          <button
            onClick={logout}
            className="px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-300 hover:text-red-400"
          >
            Sign Out ({user?.name?.split(" ")[0]})
          </button>
        </div>
      </header>

      {/* Active Tickets Grid */}
      <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-serif font-bold">
            Active Kitchen Queue ({tickets.length})
          </h1>
          <div className="flex gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300">
              Pending/Confirmed: {tickets.filter((t) => ["Pending", "Confirmed"].includes(t.status)).length}
            </span>
            <span className="px-3 py-1 rounded-full bg-orange-500/15 text-orange-300">
              Preparing: {tickets.filter((t) => t.status === "Preparing").length}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300">
              Ready: {tickets.filter((t) => t.status === "Ready").length}
            </span>
          </div>
        </div>

        {loading ? (
          <p className="text-stone-400 text-center py-20">Connecting to kitchen queue...</p>
        ) : tickets.length === 0 ? (
          <div className="border border-stone-800 bg-stone-900/50 rounded-3xl p-16 text-center">
            <p className="text-3xl mb-2">👨‍🍳</p>
            <h2 className="text-xl font-bold">All Caught Up!</h2>
            <p className="text-sm text-stone-400 mt-1">
              New customer orders will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {tickets.map((ticket) => {
              const minsAgo = Math.max(
                1,
                Math.round((Date.now() - new Date(ticket.createdAt).getTime()) / 60000)
              );
              const action = NEXT_STATUS[ticket.status];
              return (
                <div
                  key={ticket._id}
                  className={`rounded-2xl border p-5 flex flex-col justify-between bg-stone-900 ${
                    ticket.status === "Ready"
                      ? "border-emerald-500/60"
                      : ticket.status === "Preparing"
                      ? "border-orange-500/70"
                      : "border-stone-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-800">
                      <div>
                        <p className="font-mono font-bold text-sm text-amber-300">
                          {ticket.orderNumber}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {ticket.orderType} {ticket.tableNumber && `· ${ticket.tableNumber}`}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          minsAgo > 25
                            ? "bg-red-500/20 text-red-300"
                            : "bg-stone-800 text-stone-300"
                        }`}
                      >
                        {minsAgo}m ago
                      </span>
                    </div>

                    <ul className="my-4 space-y-2.5">
                      {ticket.items.map((item, idx) => (
                        <li key={idx} className="text-sm">
                          <div className="flex items-start gap-2">
                            <span className="px-2 py-0.5 rounded bg-stone-800 text-amber-400 font-bold text-xs">
                              {item.quantity}×
                            </span>
                            <div>
                              <p className="font-semibold text-white leading-tight">{item.name}</p>
                              {item.notes && (
                                <p className="text-xs text-amber-300 mt-0.5">
                                  Note: {item.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {ticket.specialInstructions && (
                      <div className="mb-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                        <strong>Order Note:</strong> {ticket.specialInstructions}
                      </div>
                    )}
                  </div>

                  {action && (
                    <button
                      onClick={() => handleAdvance(ticket)}
                      className={`w-full py-3 rounded-xl font-bold text-sm text-white transition ${action.color}`}
                    >
                      {action.label} →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
