import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMenuItems, deleteMenuItem, updateMenuItem } from "../../services/menuService";
import { useToast } from "../../context/ToastContext";
import Loading from "../../components/Loading";

export default function MenuItems() {
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getMenuItems({ search: search.trim() || undefined })
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [search]);

  const handleToggleAvailability = async (item) => {
    try {
      const fd = new FormData();
      fd.append("availability", String(!item.availability));
      await updateMenuItem(item._id, fd);
      addToast(`${item.name} marked ${!item.availability ? "Available" : "Unavailable"}`);
      load();
    } catch {
      addToast("Could not update availability", "error");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" from menu?`)) return;
    try {
      await deleteMenuItem(id);
      addToast("Menu item deleted", "info");
      load();
    } catch {
      addToast("Could not delete item", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink">Menu Catalog</h1>
          <p className="text-xs text-stone-500">Manage dishes, pricing, dietary tags, and live availability</p>
        </div>
        <Link
          to="/admin/menu-items/add"
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition shadow-sm"
        >
          + Add Menu Item
        </Link>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-stone-200/80">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search dishes by name or category..."
          className="w-full sm:w-80 px-4 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
        />
      </div>

      {loading ? (
        <Loading text="Loading menu catalog..." />
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200/80 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-500 border-b border-stone-200">
              <tr>
                <th className="px-4 py-3">Dish</th>
                <th className="px-4 py-3">Category &amp; Dietary</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {items.map((item) => (
                <tr key={item._id} className="hover:bg-stone-50/70">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <img
                      src={
                        item.image?.url ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&q=80"
                      }
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-ink">{item.name}</p>
                      <p className="text-[11px] text-stone-400">
                        ⏱ {item.prepTime || 15}m · {item.spiceLevel || "Medium"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className="font-medium text-ink">{item.category}</span>
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                      {item.dietary || "Veg"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-ink">₹{item.price}</td>
                  <td className="px-4 py-3 text-xs text-amber-600 font-semibold">
                    ★ {item.rating ? item.rating.toFixed(1) : "—"} ({item.ratingCount || 0})
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.availability
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.availability ? "Available" : "Sold Out"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3 text-xs font-semibold">
                    <Link
                      to={`/admin/menu-items/edit/${item._id}`}
                      className="text-primary hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item._id, item.name)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
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
