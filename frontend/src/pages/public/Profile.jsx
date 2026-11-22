import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { updateProfile, changePassword } from "../../services/authService";

export default function Profile() {
  const { user, setUser, refreshProfile } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    refreshProfile().then((data) => {
      if (data) {
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
      }
    });
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile({ name, email, phone });
      setUser((prev) => ({ ...prev, ...updated }));
      addToast("Profile updated successfully");
    } catch (err) {
      addToast(err.response?.data?.message || "Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setChangingPw(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      addToast("Password changed successfully");
    } catch (err) {
      addToast(err.response?.data?.message || "Could not change password", "error");
    } finally {
      setChangingPw(false);
    }
  };

  const favoriteItems = (user?.favorites || []).filter((f) => typeof f === "object" && f !== null);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Guest Account</p>
          <h1 className="text-3xl font-serif font-bold text-ink mt-1">My Profile</h1>
        </div>
        <div className="flex gap-3">
          <Link to="/orders" className="px-4 py-2 rounded-full bg-white border border-stone-200 text-xs font-semibold hover:border-primary">
            My Orders
          </Link>
          <Link to="/reservations" className="px-4 py-2 rounded-full bg-white border border-stone-200 text-xs font-semibold hover:border-primary">
            My Reservations
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <form onSubmit={handleProfileSave} className="bg-white rounded-3xl p-6 border border-stone-200/80 space-y-4">
          <h2 className="text-lg font-bold text-ink">Personal Information</h2>
          <div>
            <label className="text-xs font-semibold text-stone-500">Full Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full mt-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-obsidian text-white text-sm font-semibold hover:bg-primary transition"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <form onSubmit={handlePasswordChange} className="bg-white rounded-3xl p-6 border border-stone-200/80 space-y-4">
          <h2 className="text-lg font-bold text-ink">Security &amp; Password</h2>
          <div>
            <label className="text-xs font-semibold text-stone-500">Current Password</label>
            <input
              required
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500">New Password</label>
            <input
              required
              minLength={6}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={changingPw}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition"
          >
            {changingPw ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Saved Favorite Dishes */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80">
        <h2 className="text-lg font-bold text-ink mb-4">Saved Favorite Dishes ({favoriteItems.length})</h2>
        {favoriteItems.length === 0 ? (
          <p className="text-sm text-stone-500">
            Tap the heart icon on any dish to bookmark your favorites here.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteItems.map((dish) => (
              <Link
                key={dish._id}
                to={`/menu/${dish._id}`}
                className="flex items-center gap-3 p-3 rounded-2xl border border-stone-100 hover:border-primary transition"
              >
                <img
                  src={dish.image?.url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80"}
                  alt={dish.name}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-ink truncate">{dish.name}</p>
                  <p className="text-xs text-primary font-bold">₹{dish.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
