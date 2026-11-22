import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import AtithyaLogo from "../../components/AtithyaLogo";

export default function Register() {
  const { registerUser, loading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await registerUser(name, email, password, phone);
      addToast("Welcome to Atithya! Your account is ready.");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-stone-200/80 shadow-soft">
        <div className="flex justify-center mb-6">
          <AtithyaLogo variant="stacked" size="sm" theme="light" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-center text-ink">Join Atithya</h1>
        <p className="text-xs text-stone-500 text-center mt-1">
          Create your guest account for faster ordering, reservations, and exclusive offers.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-stone-500">Full Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aarav Sharma"
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
              placeholder="you@example.com"
              className="w-full mt-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500">Phone Number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full mt-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500">Password (min 6 chars)</label>
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition shadow-glow disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Guest Account"}
          </button>
        </form>

        <p className="text-center text-xs text-stone-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}