import { useEffect, useState } from "react";
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from "../../services/operationsService";
import { useToast } from "../../context/ToastContext";
import Loading from "../../components/Loading";

export default function Coupons() {
  const { addToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultExpiry = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 15,
    minOrderAmount: 300,
    maxDiscount: 200,
    expiresAt: defaultExpiry,
  });

  const load = () => {
    setLoading(true);
    getAllCoupons()
      .then(setCoupons)
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCoupon(form);
      setForm({
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: 15,
        minOrderAmount: 300,
        maxDiscount: 200,
        expiresAt: defaultExpiry,
      });
      addToast("Promo coupon created!");
      load();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to create coupon", "error");
    }
  };

  const handleToggle = async (c) => {
    try {
      await updateCoupon(c._id, { isActive: !c.isActive });
      addToast(`${c.code} ${!c.isActive ? "activated" : "paused"}`);
      load();
    } catch {
      addToast("Update failed", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await deleteCoupon(id);
      addToast("Coupon deleted", "info");
      load();
    } catch {
      addToast("Delete failed", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-ink">Coupons &amp; Promotional Offers</h1>
        <p className="text-xs text-stone-500">Create percentage or flat discount codes with minimum order rules</p>
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-white rounded-2xl p-5 border border-stone-200/80 grid sm:grid-cols-3 lg:grid-cols-6 gap-3 items-end"
      >
        <div>
          <label className="text-xs font-semibold text-stone-500">Code</label>
          <input
            required
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="DIWALI25"
            className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-200 text-sm font-mono uppercase"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-stone-500">Description</label>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Festive 25% off"
            className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-200 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-500">Type &amp; Value</label>
          <div className="flex gap-1 mt-1">
            <select
              value={form.discountType}
              onChange={(e) => setForm({ ...form, discountType: e.target.value })}
              className="px-2 py-2 rounded-xl border border-stone-200 text-xs"
            >
              <option value="percentage">%</option>
              <option value="flat">₹</option>
            </select>
            <input
              type="number"
              min={1}
              required
              value={form.discountValue}
              onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
              className="w-full px-2 py-2 rounded-xl border border-stone-200 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-500">Min Order (₹)</label>
          <input
            type="number"
            min={0}
            value={form.minOrderAmount}
            onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })}
            className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-200 text-sm"
          />
        </div>
        <button
          type="submit"
          className="py-2.5 px-4 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition"
        >
          + Create
        </button>
      </form>

      {loading ? (
        <Loading text="Loading coupons..." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <div key={c._id} className="bg-white rounded-2xl p-5 border border-stone-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-lg text-primary">{c.code}</span>
                  <button
                    onClick={() => handleToggle(c)}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      c.isActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"
                    }`}
                  >
                    {c.isActive ? "Active" : "Paused"}
                  </button>
                </div>
                <p className="text-xs text-stone-600 mt-2">{c.description || "Promotional offer"}</p>
                <div className="mt-3 text-xs text-stone-500 space-y-1">
                  <p>
                    <strong>Discount:</strong>{" "}
                    {c.discountType === "percentage" ? `${c.discountValue}%` : `₹${c.discountValue} flat`}
                    {c.maxDiscount > 0 && c.discountType === "percentage" && ` (max ₹${c.maxDiscount})`}
                  </p>
                  <p><strong>Min Order:</strong> ₹{c.minOrderAmount}</p>
                  <p><strong>Used:</strong> {c.usedCount} / {c.usageLimit}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 flex justify-between items-center text-xs">
                <span className="text-stone-400">
                  Exp: {new Date(c.expiresAt).toLocaleDateString("en-IN")}
                </span>
                <button onClick={() => handleDelete(c._id)} className="text-red-600 font-semibold hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
