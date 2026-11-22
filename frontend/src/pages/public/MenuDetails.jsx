import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMenuItem } from "../../services/menuService";
import { submitReview, deleteReview } from "../../services/operationsService";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import Loading from "../../components/Loading";

export default function MenuDetails() {
  const { id } = useParams();
  const { addItem, setIsOpen } = useCart();
  const { user, toggleFavorite } = useAuth();
  const { addToast } = useToast();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadItem = () => {
    setLoading(true);
    getMenuItem(id)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadItem();
  }, [id]);

  if (loading) return <Loading text="Loading dish details..." />;
  if (!item) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-2xl font-serif font-bold">Dish not found</h2>
        <Link to="/menu" className="inline-block mt-4 text-primary font-semibold">
          ← Back to Menu
        </Link>
      </div>
    );
  }

  const isFav = user?.favorites?.some(
    (f) => (typeof f === "string" ? f : f._id) === item._id
  );

  const handleAddToCart = () => {
    addItem(item, qty, notes);
    addToast(`Added ${qty} × ${item.name} to basket`);
    setIsOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast("Please sign in to submit a review", "info");
      return;
    }
    setSubmittingReview(true);
    try {
      await submitReview(item._id, { rating, comment });
      addToast("Thank you for reviewing this dish!");
      setComment("");
      loadItem();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to post review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      addToast("Review deleted", "info");
      loadItem();
    } catch {
      addToast("Could not delete review", "error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <Link to="/menu" className="text-sm font-medium text-stone-500 hover:text-primary">
        ← Back to Menu
      </Link>

      <div className="grid lg:grid-cols-2 gap-10 mt-6 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-soft">
        <div className="relative rounded-2xl overflow-hidden h-80 sm:h-[420px] bg-stone-100">
          <img
            src={
              item.image?.url ||
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"
            }
            alt={item.name}
            className="w-full h-full object-cover"
          />
          {item.isBestseller && (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold uppercase tracking-wider">
              ★ Bestseller
            </span>
          )}
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                {item.category} · {item.dietary}
              </span>
              {user && (
                <button
                  onClick={async () => {
                    const res = await toggleFavorite(item._id);
                    addToast(res.isFavorite ? "Added to favorites" : "Removed from favorites", "info");
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                    isFav
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-stone-50 text-stone-600 border-stone-200 hover:border-red-300"
                  }`}
                >
                  {isFav ? "♥ Saved" : "♡ Save Dish"}
                </button>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-ink mt-2">
              {item.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-stone-500">
              <span className="font-semibold text-amber-600">
                ★ {item.rating ? item.rating.toFixed(1) : "New"} ({item.ratingCount || 0} reviews)
              </span>
              <span>⏱ {item.prepTime || 15} mins prep</span>
              {item.spiceLevel && item.spiceLevel !== "None" && (
                <span>🌶 {item.spiceLevel}</span>
              )}
              {item.calories > 0 && <span>🔥 {item.calories} kcal</span>}
            </div>

            <p className="text-stone-600 mt-5 leading-relaxed">{item.description}</p>

            <div className="mt-6">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Chef Instructions (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Less spicy, no onion/garlic, extra mint chutney..."
                className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-stone-400">Price</p>
              <p className="text-3xl font-bold text-ink">₹{item.price * qty}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex items-center border border-stone-200 rounded-full">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 font-bold text-stone-600 hover:text-primary"
                >
                  −
                </button>
                <span className="px-3 font-bold text-ink">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-10 h-10 font-bold text-stone-600 hover:text-primary"
                >
                  +
                </button>
              </div>

              <button
                disabled={!item.availability}
                onClick={handleAddToCart}
                className="px-7 py-3.5 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-dark disabled:opacity-40 transition shadow-glow"
              >
                {item.availability ? "Add to Basket" : "Unavailable"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="grid lg:grid-cols-3 gap-8 mt-12">
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 h-fit">
          <h3 className="text-xl font-serif font-bold text-ink">Rate this Dish</h3>
          <p className="text-xs text-stone-500 mt-1">
            Share your tasting notes with fellow Atithya guests.
          </p>

          <form onSubmit={handleReviewSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-600">Your Rating</label>
              <div className="flex gap-1.5 mt-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl transition ${
                      star <= rating ? "text-amber-400" : "text-stone-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-600">Your Review</label>
              <textarea
                rows="3"
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the flavor, portion, and presentation?"
                className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="w-full py-2.5 rounded-xl bg-obsidian text-white text-sm font-semibold hover:bg-primary transition disabled:opacity-50"
            >
              {submittingReview ? "Submitting..." : "Post Review"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-serif font-bold text-ink">
            Guest Reviews ({item.reviews?.length || 0})
          </h3>
          {!item.reviews || item.reviews.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center text-sm text-stone-500">
              No reviews yet. Be the first to review {item.name}!
            </div>
          ) : (
            item.reviews.map((rev) => (
              <div
                key={rev._id}
                className="bg-white rounded-2xl p-5 border border-stone-200/80 flex justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-ink">
                      {rev.user?.name || "Atithya Guest"}
                    </span>
                    <span className="text-amber-500 text-xs font-bold">
                      {"★".repeat(rev.rating)}
                      {"☆".repeat(5 - rev.rating)}
                    </span>
                    {rev.isVerifiedOrder && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                        ✓ Verified Order
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-stone-600 mt-2 leading-relaxed">{rev.comment}</p>
                  <p className="text-[11px] text-stone-400 mt-2">
                    {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {(user?._id === rev.user?._id || user?.role === "admin") && (
                  <button
                    onClick={() => handleDeleteReview(rev._id)}
                    className="text-xs text-stone-400 hover:text-red-500 h-fit"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}