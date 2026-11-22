import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const DIETARY_BADGE = {
  Veg: { dot: "bg-forest", border: "border-forest", label: "Veg" },
  Vegan: { dot: "bg-forest", border: "border-forest", label: "Vegan" },
  "Non-Veg": { dot: "bg-danger", border: "border-danger", label: "Non-Veg" },
  Egg: { dot: "bg-warning", border: "border-warning", label: "Egg" },
};

export default function MenuCard({ item }) {
  const { addItem, items, updateQuantity } = useCart();
  const { user, toggleFavorite } = useAuth();
  const { addToast } = useToast();

  const fallback =
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80";
  const badge = DIETARY_BADGE[item.dietary] || DIETARY_BADGE.Veg;
  const cartEntry = items.find((i) => i._id === item._id);
  const isFav = user?.favorites?.some(
    (f) => (typeof f === "string" ? f : f._id) === item._id
  );

  const handleAdd = () => {
    if (!item.availability) return;
    addItem(item, 1);
    addToast(`Added ${item.name} to My Selection`);
  };

  const handleFav = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast("Sign in to save favorite dishes", "info");
      return;
    }
    try {
      const res = await toggleFavorite(item._id);
      addToast(res.isFavorite ? "Saved to favorites" : "Removed from favorites", "info");
    } catch {
      addToast("Could not update favorites", "error");
    }
  };

  return (
    <div className="group bg-white rounded-[16px] border border-borderWarm overflow-hidden shadow-2xs hover:shadow-soft hover:-translate-y-0.5 hover:border-gold/60 transition-all duration-300 flex flex-col">
      <div className="relative h-48 overflow-hidden bg-ivory">
        <Link to={`/menu/${item._id}`}>
          <img
            src={item.image?.url || fallback}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[11px] font-semibold text-brown shadow-xs">
            <span className={`w-3 h-3 rounded-xs border ${badge.border} flex items-center justify-center`}>
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
            </span>
            {badge.label}
          </span>
          {item.isBestseller && (
            <span className="px-2.5 py-1 rounded-full bg-gold text-espresso text-[10px] font-bold uppercase tracking-wider shadow-xs">
              Bestseller
            </span>
          )}
        </div>

        <button
          onClick={handleFav}
          aria-label="Toggle favorite"
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xs transition ${
            isFav
              ? "bg-danger text-white"
              : "bg-white/90 text-muted hover:text-danger"
          }`}
        >
          {isFav ? "♥" : "♡"}
        </button>

        {!item.availability && (
          <div className="absolute inset-0 bg-espresso/65 flex items-center justify-center">
            <span className="px-3.5 py-1 rounded-full bg-ivory text-xs font-bold text-brown uppercase tracking-wider">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col bg-white">
        <div className="flex items-center justify-between gap-2 text-xs text-muted mb-1">
          <span className="font-semibold text-primary">{item.category}</span>
          <div className="flex items-center gap-2">
            {item.prepTime > 0 && <span>⏱ {item.prepTime}m</span>}
            {item.rating > 0 && (
              <span className="inline-flex items-center gap-0.5 font-semibold text-gold-dark">
                ★ {item.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        <Link
          to={`/menu/${item._id}`}
          className="font-serif font-bold text-brown text-lg leading-snug hover:text-primary transition line-clamp-1"
        >
          {item.name}
        </Link>

        <p className="text-xs text-muted mt-1.5 line-clamp-2 flex-1 leading-relaxed">
          {item.description}
        </p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-borderWarm">
          <div>
            <span className="font-bold text-forest text-lg">₹{item.price}</span>
            {item.spiceLevel && item.spiceLevel !== "None" && (
              <span className="ml-2 text-[11px] text-muted">· {item.spiceLevel}</span>
            )}
          </div>

          {cartEntry ? (
            <div className="inline-flex items-center rounded-full bg-primary text-white text-sm font-semibold shadow-xs">
              <button
                onClick={() => updateQuantity(item._id, -1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-primary-dark rounded-l-full transition"
              >
                −
              </button>
              <span className="px-2 text-xs font-bold">{cartEntry.quantity}</span>
              <button
                onClick={() => updateQuantity(item._id, 1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-primary-dark rounded-r-full transition"
              >
                +
              </button>
            </div>
          ) : (
            <button
              disabled={!item.availability}
              onClick={handleAdd}
              className="px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary-dark disabled:opacity-40 transition shadow-xs"
            >
              + Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}