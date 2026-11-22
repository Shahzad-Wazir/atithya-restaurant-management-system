import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getMenuItem, updateMenuItem } from "../../services/menuService";
import { useToast } from "../../context/ToastContext";
import Loading from "../../components/Loading";

export default function EditMenuItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [form, setForm] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMenuItem(id)
      .then((item) =>
        setForm({
          name: item.name || "",
          description: item.description || "",
          category: item.category || "Main Course",
          price: item.price ?? "",
          dietary: item.dietary || "Veg",
          spiceLevel: item.spiceLevel || "Medium",
          prepTime: item.prepTime || 15,
          calories: item.calories || 0,
          availability: Boolean(item.availability),
          isFeatured: Boolean(item.isFeatured),
          isBestseller: Boolean(item.isBestseller),
          imageUrl: item.image?.url || "",
        })
      )
      .catch(() => addToast("Could not load dish", "error"));
  }, [id]);

  if (!form) return <Loading text="Loading dish..." />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (imageFile) fd.append("image", imageFile);

      await updateMenuItem(id, fd);
      addToast("Dish updated successfully!");
      navigate("/admin/menu-items");
    } catch (err) {
      addToast(err.response?.data?.message || "Update failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold text-ink">Edit Dish</h1>
        <Link to="/admin/menu-items" className="text-xs font-semibold text-stone-500 hover:text-primary">
          ← Back to Catalog
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-stone-500">Dish Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500">Price (₹)</label>
            <input
              required
              type="number"
              min={1}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-stone-500">Description</label>
          <textarea
            required
            rows="3"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full mt-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-stone-500">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
            >
              {["Starter", "Main Course", "Breads & Rice", "Dessert", "Beverage", "Chef's Special"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500">Dietary</label>
            <select
              value={form.dietary}
              onChange={(e) => setForm({ ...form, dietary: e.target.value })}
              className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
            >
              {["Veg", "Non-Veg", "Vegan", "Egg"].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500">Spice Level</label>
            <select
              value={form.spiceLevel}
              onChange={(e) => setForm({ ...form, spiceLevel: e.target.value })}
              className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
            >
              {["None", "Mild", "Medium", "Spicy", "Extra Spicy"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-stone-500">Prep Time (mins)</label>
            <input
              type="number"
              min={1}
              value={form.prepTime}
              onChange={(e) => setForm({ ...form, prepTime: Number(e.target.value) })}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500">Calories (kcal)</label>
            <input
              type="number"
              min={0}
              value={form.calories}
              onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-stone-500">Replace Image (Upload)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full mt-1 text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500">Image URL</label>
            <input
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full mt-1 px-4 py-2 rounded-xl border border-stone-200 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6 pt-2 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.availability}
              onChange={(e) => setForm({ ...form, availability: e.target.checked })}
            />
            Available Now
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
            />
            Featured Dish
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isBestseller}
              onChange={(e) => setForm({ ...form, isBestseller: e.target.checked })}
            />
            Bestseller Badge
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-7 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition shadow-glow"
        >
          {submitting ? "Updating..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
