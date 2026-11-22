import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import AtithyaLogo from "./AtithyaLogo";

export default function Navbar() {
  const { user, logout, isAdmin, isKitchen } = useAuth();
  const { itemCount, setIsOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors whitespace-nowrap ${
      isActive ? "text-primary font-semibold" : "text-espresso hover:text-primary"
    }`;

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-md border-b border-borderWarm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        <Link to="/" className="shrink-0">
          <AtithyaLogo size="sm" theme="light" />
        </Link>

        {/* Desktop Nav — Equal spacing */}
        <nav className="hidden lg:flex items-center gap-7">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/menu" className={navLinkClass}>Menu</NavLink>
          <NavLink to="/reserve" className={navLinkClass}>Book a Table</NavLink>
          {user && <NavLink to="/orders" className={navLinkClass}>My Orders</NavLink>}
          {user && <NavLink to="/reservations" className={navLinkClass}>Reservations</NavLink>}
          <NavLink to="/about" className={navLinkClass}>Story</NavLink>
          <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
        </nav>

        {/* Right Actions — Consistent h-10 height across Selection & Profile buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {isKitchen && (
            <Link
              to="/kitchen"
              className="hidden xl:inline-flex items-center h-10 px-3.5 rounded-full bg-gold/15 text-brown border border-gold/40 hover:bg-gold/25 transition text-xs font-semibold"
            >
              Kitchen Display
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="hidden md:inline-flex items-center h-10 px-4 rounded-full bg-espresso text-gold hover:bg-brown transition text-xs font-semibold"
            >
              Admin Console
            </Link>
          )}

          {/* My Selection (Cart) Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full bg-white text-espresso border border-borderWarm hover:border-primary hover:text-primary transition font-semibold text-sm shadow-2xs"
            aria-label="Open My Selection"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="hidden sm:inline whitespace-nowrap">My Selection</span>
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center shadow">
                {itemCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 h-10 px-3.5 rounded-full bg-white border border-borderWarm hover:border-gold transition text-sm font-medium text-espresso"
              >
                <span className="w-6 h-6 rounded-full bg-espresso text-gold text-xs font-bold flex items-center justify-center uppercase">
                  {user.name?.[0] || "G"}
                </span>
                <span className="max-w-[90px] truncate">{user.name?.split(" ")[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs font-medium text-muted hover:text-danger px-2 h-10"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center h-10 px-3 text-sm font-medium text-espresso hover:text-primary transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center h-10 px-4 text-sm font-semibold bg-primary text-white rounded-full hover:bg-primary-dark transition shadow-sm"
              >
                Join Atithya
              </Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl text-espresso hover:bg-white border border-transparent hover:border-borderWarm transition"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-ivory border-t border-borderWarm px-6 py-4 space-y-3 shadow-lg">
          <div className="flex flex-col gap-3">
            <NavLink to="/" end onClick={() => setMobileOpen(false)} className={navLinkClass}>Home</NavLink>
            <NavLink to="/menu" onClick={() => setMobileOpen(false)} className={navLinkClass}>Menu</NavLink>
            <NavLink to="/reserve" onClick={() => setMobileOpen(false)} className={navLinkClass}>Book a Table</NavLink>
            {user && <NavLink to="/orders" onClick={() => setMobileOpen(false)} className={navLinkClass}>My Orders</NavLink>}
            {user && <NavLink to="/reservations" onClick={() => setMobileOpen(false)} className={navLinkClass}>My Reservations</NavLink>}
            {user && <NavLink to="/profile" onClick={() => setMobileOpen(false)} className={navLinkClass}>Profile</NavLink>}
            <NavLink to="/about" onClick={() => setMobileOpen(false)} className={navLinkClass}>Our Story</NavLink>
            <NavLink to="/contact" onClick={() => setMobileOpen(false)} className={navLinkClass}>Contact</NavLink>
            {isKitchen && (
              <NavLink to="/kitchen" onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-gold-dark">
                Kitchen Display
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-espresso">
                Admin Console
              </NavLink>
            )}
          </div>
          <div className="pt-3 border-t border-borderWarm flex flex-wrap items-center gap-3">
            {user ? (
              <button onClick={handleLogout} className="text-sm font-semibold text-danger">
                Sign Out ({user.name})
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-espresso">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded-full"
                >
                  Join Atithya
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}