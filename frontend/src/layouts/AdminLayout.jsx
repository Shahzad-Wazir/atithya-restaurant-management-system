import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AtithyaLogo from "../components/AtithyaLogo";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Overview & Analytics", icon: "📊" },
  { to: "/admin/orders", label: "Live Orders", icon: "🧾" },
  { to: "/admin/billing", label: "Billing, Hero & PDF", icon: "📑" },
  { to: "/admin/reservations", label: "Reservations", icon: "📅" },
  { to: "/admin/tables", label: "Floor & Tables", icon: "🪑" },
  { to: "/admin/menu-items", label: "Menu Catalog", icon: "🍽️" },
  { to: "/admin/coupons", label: "Coupons & Offers", icon: "🏷️" },
  { to: "/admin/inquiries", label: "Guest Inquiries", icon: "✉️" },
  { to: "/admin/users", label: "Users & Staff", icon: "👥" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? "bg-primary text-white shadow-glow"
        : "text-ivory hover:bg-brown hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-ivory flex overflow-x-hidden">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-espresso/60 backdrop-blur-xs lg:hidden no-print"
        />
      )}

      {/* Espresso Sidebar (#17120F) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 bg-espresso text-ivory flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 border-r border-gold/15 no-print ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-6 border-b border-gold/15 flex items-center justify-between">
          <Link to="/admin/dashboard" onClick={() => setSidebarOpen(false)}>
            <AtithyaLogo theme="dark" size="sm" />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gold hover:text-white p-1"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={linkClass}
            >
              <span className="w-5 text-center text-base leading-none shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}

          <div className="pt-4 mt-4 border-t border-gold/15 space-y-1">
            <Link
              to="/kitchen"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gold hover:bg-brown transition-colors"
            >
              <span className="w-5 text-center text-base leading-none shrink-0">👨‍🍳</span>
              <span>Kitchen Display (KDS)</span>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-ivory/75 hover:bg-brown hover:text-white transition-colors"
            >
              <span className="w-5 text-center text-base leading-none shrink-0">🌐</span>
              <span>View Public Site</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-gold/15">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold/40 text-gold font-bold flex items-center justify-center text-sm uppercase shrink-0">
              {user?.name?.[0] || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-white">{user?.name}</p>
              <p className="text-xs text-ivory/60 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 rounded-xl bg-brown hover:bg-danger text-xs font-semibold text-ivory transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Warm Ivory Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-borderWarm px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 no-print">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl hover:bg-ivory text-brown border border-borderWarm"
              aria-label="Open admin navigation"
            >
              ☰
            </button>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Atithya Enterprise Console
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-forest-soft text-forest border border-forest/20">
              <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
              System Online
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
