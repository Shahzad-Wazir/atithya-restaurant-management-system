import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AtithyaLogo from "../../components/AtithyaLogo";

export default function AdminLogin() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await login(email, password);
      if (data.role === "admin") navigate("/admin/dashboard");
      else if (data.role === "kitchen") navigate("/kitchen");
      else setError("This portal is restricted to Atithya Admin & Kitchen staff.");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex justify-center mb-6">
          <AtithyaLogo variant="stacked" theme="dark" size="md" />
        </div>
        <h1 className="text-xl font-serif font-bold text-center">Staff &amp; Admin Portal</h1>
        <p className="text-xs text-stone-400 text-center mt-1">
          Authorized access for Atithya Management and Kitchen Chefs
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950 border border-red-800 text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-stone-400">Staff Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter staff email"
              className="w-full mt-1 px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-sm text-white outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-400">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-1 px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-sm text-white outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition shadow-glow"
          >
            {loading ? "Authenticating..." : "Enter Console"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-stone-400 hover:text-amber-400">
            ← Return to Public Site
          </Link>
        </div>
      </div>
    </div>
  );
}
