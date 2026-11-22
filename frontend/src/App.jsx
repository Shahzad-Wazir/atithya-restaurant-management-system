import { Routes, Route, Link } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Public & Customer Pages
import Home from "./pages/public/Home";
import MenuDetails from "./pages/public/MenuDetails";
import Checkout from "./pages/public/Checkout";
import MyOrders from "./pages/public/MyOrders";
import BookTable from "./pages/public/BookTable";
import MyReservations from "./pages/public/MyReservations";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import Profile from "./pages/public/Profile";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";

// Kitchen Display System (KDS)
import KitchenDisplay from "./pages/kitchen/KitchenDisplay";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import BillingAndReports from "./pages/admin/BillingAndReports";
import Reservations from "./pages/admin/Reservations";
import Tables from "./pages/admin/Tables";
import MenuItems from "./pages/admin/MenuItems";
import AddMenuItem from "./pages/admin/AddMenuItem";
import EditMenuItem from "./pages/admin/EditMenuItem";
import Coupons from "./pages/admin/Coupons";
import Inquiries from "./pages/admin/Inquiries";
import Users from "./pages/admin/Users";

export default function App() {
  return (
    <Routes>
      {/* Public & Customer Site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Home />} />
        <Route path="/menu/:id" element={<MenuDetails />} />
        <Route path="/reserve" element={<BookTable />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservations"
          element={
            <ProtectedRoute>
              <MyReservations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Kitchen Display System (KDS) */}
      <Route
        path="/kitchen"
        element={
          <ProtectedRoute kitchenOnly>
            <KitchenDisplay />
          </ProtectedRoute>
        }
      />

      {/* Staff & Admin Auth */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin Enterprise Console */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="billing" element={<BillingAndReports />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="tables" element={<Tables />} />
        <Route path="menu-items" element={<MenuItems />} />
        <Route path="menu-items/add" element={<AddMenuItem />} />
        <Route path="menu-items/edit/:id" element={<EditMenuItem />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="inquiries" element={<Inquiries />} />
        <Route path="users" element={<Users />} />
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex flex-col items-center justify-center bg-ivory text-center px-6">
            <h1 className="text-6xl font-serif font-bold text-primary">404</h1>
            <p className="text-brown/70 mt-3">The page you are looking for does not exist at Atithya.</p>
            <Link
              to="/"
              className="mt-6 px-6 py-2.5 rounded-full bg-espresso text-gold text-sm font-semibold hover:bg-primary hover:text-white transition"
            >
              Return to Atithya Home
            </Link>
          </div>
        }
      />
    </Routes>
  );
}