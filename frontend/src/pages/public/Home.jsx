import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMenuItems } from "../../services/menuService";
import { getActiveCoupons, getBillingConfig } from "../../services/operationsService";
import MenuCard from "../../components/MenuCard";
import Loading from "../../components/Loading";

const CATEGORIES = [
  "All",
  "Chef's Special",
  "Starter",
  "Main Course",
  "Breads & Rice",
  "Dessert",
  "Beverage",
];
const DIETARY = ["All", "Veg", "Non-Veg", "Vegan", "Egg"];

const DEFAULT_HERO = {
  badge: "Chef's Signature",
  title: "24-Hr Smoked Dal Makhani",
  imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=900&q=85",
};

export default function Home() {
  const [items, setItems] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [heroShowcase, setHeroShowcase] = useState(DEFAULT_HERO);
  const [category, setCategory] = useState("All");
  const [dietary, setDietary] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);

  const fetchMenu = useCallback(() => {
    getMenuItems({
      category: category === "All" ? undefined : category,
      dietary: dietary === "All" ? undefined : dietary,
      search: search.trim() || undefined,
      sort: sort === "featured" ? undefined : sort,
    })
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [category, dietary, search, sort]);

  const fetchSiteConfig = useCallback(() => {
    getActiveCoupons().then(setCoupons).catch(() => setCoupons([]));
    getBillingConfig()
      .then((cfg) => {
        if (cfg?.heroShowcase) {
          setHeroShowcase({
            badge: cfg.heroShowcase.badge || DEFAULT_HERO.badge,
            title: cfg.heroShowcase.title || DEFAULT_HERO.title,
            imageUrl: cfg.heroShowcase.imageUrl || DEFAULT_HERO.imageUrl,
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchSiteConfig();
  }, [fetchSiteConfig]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(fetchMenu, 180);
    return () => clearTimeout(timer);
  }, [fetchMenu]);

  // Live sync when switching back from Admin tab
  useEffect(() => {
    const onFocus = () => {
      fetchMenu();
      fetchSiteConfig();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchMenu, fetchSiteConfig]);

  return (
    <div className="bg-ivory overflow-x-hidden">
      {/* Luxury Espresso Hero Section — Text appears first on mobile */}
      <section className="relative bg-espresso text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(196,154,69,0.16),transparent_55%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16 lg:py-24 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center relative z-10">
          <div>
            <p className="inline-flex items-center gap-2 text-gold text-xs font-semibold tracking-[0.26em] uppercase mb-5">
              <span className="w-8 h-[1px] bg-gold/70" />
              Atithi Devo Bhava · Royal Hospitality
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-[1.1] text-white">
              Authentic <span className="text-gold font-luxury-italic font-semibold">Indian</span>
              <br />
              Fine Dining
            </h1>

            <p className="text-ivory/80 mt-5 text-sm sm:text-base max-w-lg leading-relaxed">
              Traditional Indian flavours crafted with heirloom spices and served with warmth at <strong className="text-white">Atithya</strong>. Reserve your favorite dining zone or order freshly prepared dishes straight to your table or door.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3.5 mt-9">
              <a
                href="#menu"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition shadow-glow"
              >
                Explore Menu &amp; Order →
              </a>
              <Link
                to="/reserve"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-brown text-gold border border-gold hover:bg-gold hover:text-espresso font-semibold text-sm transition"
              >
                Reserve a Table
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-10 pt-8 border-t border-gold/20 max-w-md">
              <div>
                <p className="text-xl sm:text-2xl font-serif font-bold text-gold">4.9★</p>
                <p className="text-xs text-ivory/70 mt-0.5">Guest Rating</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-serif font-bold text-gold">25 min</p>
                <p className="text-xs text-ivory/70 mt-0.5">Avg. Prep Time</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-serif font-bold text-gold">4 Zones</p>
                <p className="text-xs text-ivory/70 mt-0.5">Fine Dining Spaces</p>
              </div>
            </div>
          </div>

          {/* Admin-Editable Hero Food Image & Chef's Signature Floating Card */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden border border-gold/25 shadow-2xl">
              <img
                src={heroShowcase.imageUrl}
                alt={heroShowcase.title}
                className="w-full h-[300px] sm:h-[380px] lg:h-[440px] object-cover"
              />
            </div>
            <div className="flex items-center gap-3.5 mt-4 sm:mt-0 sm:absolute sm:-bottom-5 sm:-left-5 bg-ivory text-brown px-5 py-3.5 rounded-2xl shadow-xl border border-gold/35">
              <div className="w-10 h-10 rounded-xl bg-espresso text-gold flex items-center justify-center text-lg shrink-0">
                ✦
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-forest font-bold">
                  {heroShowcase.badge}
                </p>
                <p className="text-sm font-bold text-brown">{heroShowcase.title}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Offers Strip */}
      {coupons.length > 0 && (
        <section className="bg-forest-soft border-b border-forest/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center gap-4 overflow-x-auto">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-forest shrink-0">
              Live Offers:
            </span>
            {coupons.map((c) => (
              <div
                key={c._id}
                className="shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-forest/20 text-xs"
              >
                <span className="font-mono font-bold text-forest">{c.code}</span>
                <span className="text-brown/80">{c.description}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Menu Section */}
      <section id="menu" className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-dark">
              Curated Kitchen
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brown mt-1">
              Explore the Atithya Menu
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes, spices..."
              className="w-full sm:w-60 px-4 py-2.5 rounded-full bg-white border border-borderWarm text-sm text-brown outline-none focus:border-primary"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2.5 rounded-full bg-white border border-borderWarm text-sm text-brown outline-none focus:border-primary"
            >
              <option value="featured">Sort: Featured</option>
              <option value="rating">Top Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition ${
                category === cat
                  ? "bg-espresso text-gold shadow-sm"
                  : "bg-white text-brown border border-borderWarm hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dietary Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap mb-10">
          <span className="text-xs font-medium text-muted mr-1">Dietary:</span>
          {DIETARY.map((d) => (
            <button
              key={d}
              onClick={() => setDietary(d)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                dietary === d
                  ? "bg-forest text-white"
                  : "bg-white border border-borderWarm text-brown/80 hover:border-forest"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {loading ? (
          <Loading text="Fetching fresh dishes from Atithya's kitchen..." />
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-borderWarm">
            <p className="text-lg font-semibold text-brown">No dishes match your filter</p>
            <p className="text-sm text-muted mt-1">
              Try clearing your search or choosing another category.
            </p>
            <button
              onClick={() => {
                setCategory("All");
                setDietary("All");
                setSearch("");
              }}
              className="mt-4 px-5 py-2 rounded-full bg-primary text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <MenuCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Table Booking CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-3xl bg-espresso text-white p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative overflow-hidden border border-gold/25">
          <div className="absolute right-0 top-0 w-72 h-72 bg-gold/15 blur-3xl rounded-full" />
          <div className="relative z-10 max-w-xl">
            <p className="text-gold text-xs font-bold uppercase tracking-[0.22em]">
              Instant Reservations
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mt-2 text-white">
              Planning a Family Dinner or Celebration?
            </h2>
            <p className="text-ivory/80 text-sm mt-3 leading-relaxed">
              Check real-time table availability across our Indoor Haveli, Outdoor Courtyard, Rooftop Terrace, and Maharaja VIP Lounge with zero waiting time.
            </p>
          </div>
          <Link
            to="/reserve"
            className="relative z-10 shrink-0 w-full sm:w-auto text-center px-8 py-4 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-sm transition shadow-glow"
          >
            Reserve Your Table →
          </Link>
        </div>
      </section>
    </div>
  );
}