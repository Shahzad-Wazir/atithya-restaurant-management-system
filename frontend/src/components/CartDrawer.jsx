import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal, itemCount, clearCart } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const estimatedTax = Math.round(subtotal * 0.05);

  const handleCheckout = () => {
    setIsOpen(false);
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
    } else {
      navigate("/checkout");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end no-print">
      <div
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
      />
      <aside className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-ink">Your Order Basket</h2>
            <p className="text-xs text-stone-500 mt-0.5">{itemCount} item(s) selected</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-primary-soft text-primary flex items-center justify-center text-2xl mb-4">
                🍽️
              </div>
              <h3 className="font-semibold text-ink text-lg">Your basket is empty</h3>
              <p className="text-sm text-stone-500 mt-1 max-w-xs">
                Explore Atithya's royal starters, curries, biryanis, and artisanal desserts.
              </p>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/menu");
                }}
                className="mt-5 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item._id}
                className="flex gap-3.5 p-3 rounded-2xl border border-stone-100 bg-stone-50/60"
              >
                <img
                  src={
                    item.image ||
                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80"
                  }
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm text-ink truncate">{item.name}</h4>
                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-xs text-stone-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">₹{item.price} each</p>
                  <div className="flex items-center justify-between mt-2.5">
                    <div className="inline-flex items-center border border-stone-200 rounded-full bg-white">
                      <button
                        onClick={() => updateQuantity(item._id, -1)}
                        className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-primary font-bold"
                      >
                        −
                      </button>
                      <span className="px-2.5 text-xs font-semibold text-ink">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, 1)}
                        className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-primary font-bold"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-bold text-sm text-ink">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-stone-200 bg-stone-50 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Estimated GST (5%)</span>
                <span>₹{estimatedTax}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-ink pt-1 border-t border-stone-200">
                <span>Estimated Total</span>
                <span className="text-primary">₹{subtotal + estimatedTax}</span>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={clearCart}
                className="px-4 py-3 rounded-xl border border-stone-300 text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
              >
                Clear
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition shadow-glow"
              >
                {user ? "Proceed to Checkout →" : "Sign In to Checkout →"}
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
