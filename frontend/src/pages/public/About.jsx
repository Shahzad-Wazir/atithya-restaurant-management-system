import { Link } from "react-router-dom";
import AtithyaLogo from "../../components/AtithyaLogo";

export default function About() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
      <div className="text-center max-w-2xl mx-auto">
        <div className="flex justify-center mb-5">
          <AtithyaLogo variant="stacked" size="md" theme="light" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-ink mt-4">
          Crafted Around <span className="text-primary">Atithi Devo Bhava</span>
        </h1>
        <p className="text-stone-600 mt-4 leading-relaxed">
          Atithya celebrates the timeless Indian spirit of hospitality — where every spice is hand-roasted, every sauce is slow-simmered, and every guest is welcomed like royalty.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            title: "24-Hour Culinary Craft",
            desc: "From charcoal-smoked Dal Makhani to hand-stretched tandoori breads, our chefs honor heirloom techniques.",
            icon: "🔥",
          },
          {
            title: "4 Distinct Dining Zones",
            desc: "Dine inside our warm Haveli hall, under the stars on the Rooftop Terrace, in the Garden Courtyard, or our VIP Lounge.",
            icon: "🏛️",
          },
          {
            title: "Seamless Digital Hospitality",
            desc: "Instant real-time table reservations, live kitchen order tracking, and transparent GST billing.",
            icon: "✨",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-3xl p-7 border border-stone-200/80 shadow-xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary-soft text-2xl flex items-center justify-center mb-4">
              {card.icon}
            </div>
            <h3 className="font-serif font-bold text-xl text-ink">{card.title}</h3>
            <p className="text-sm text-stone-500 mt-2 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-obsidian text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif font-bold">Experience Atithya Tonight</h2>
          <p className="text-stone-400 text-sm mt-2">
            Reserve a table or order your favorites online in just a few clicks.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/reserve"
            className="px-6 py-3 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition"
          >
            Book a Table
          </Link>
          <Link
            to="/menu"
            className="px-6 py-3 rounded-full bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition"
          >
            Explore Menu
          </Link>
        </div>
      </div>
    </div>
  );
}