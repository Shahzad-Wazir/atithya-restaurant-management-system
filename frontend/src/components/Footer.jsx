import { Link } from "react-router-dom";
import AtithyaLogo from "./AtithyaLogo";

export default function Footer() {
  return (
    <footer className="bg-espresso text-ivory border-t border-gold/25 no-print">
      <div className="max-w-7xl mx-auto px-6 py-14 grid sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div className="sm:col-span-2 space-y-4">
          <AtithyaLogo theme="dark" size="md" />
          <p className="text-sm text-ivory/80 max-w-md leading-relaxed">
            Inspired by <span className="text-gold font-luxury-italic text-lg">Atithi Devo Bhava</span> — Atithya brings royal Indian culinary craft, seamless table reservations, and warm hospitality together under one roof.
          </p>
          <div className="flex flex-wrap gap-3 pt-1 text-xs text-ivory/85">
            <span className="px-3.5 py-1.5 rounded-full bg-brown border border-gold/25">
              Open Daily: 11:30 AM – 11:30 PM
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-brown border border-gold/25">
              Dine-In · Takeaway · Delivery
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-ivory font-semibold text-xs uppercase tracking-[0.2em] mb-4">Explore</h4>
          <ul className="space-y-2.5 text-sm text-gold">
            <li><Link to="/menu" className="hover:text-ivory transition">Full Menu</Link></li>
            <li><Link to="/reserve" className="hover:text-ivory transition">Book a Table</Link></li>
            <li><Link to="/orders" className="hover:text-ivory transition">Track Orders</Link></li>
            <li><Link to="/about" className="hover:text-ivory transition">Our Heritage</Link></li>
            <li><Link to="/contact" className="hover:text-ivory transition">Contact &amp; Events</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-ivory font-semibold text-xs uppercase tracking-[0.2em] mb-4">Visit Us</h4>
          <ul className="space-y-2.5 text-sm text-ivory/80">
            <li>24 Park Mansion, Park Street, Kolkata</li>
            <li>+91 98765 43210</li>
            <li>concierge@atithya.com</li>
            <li className="pt-2">
              <Link to="/admin/login" className="text-xs font-medium text-gold hover:text-ivory transition">
                Staff &amp; Admin Portal →
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gold/20 py-5 px-6 text-center text-xs text-ivory/60">
        © {new Date().getFullYear()} Atithya Hospitality Pvt. Ltd. All rights reserved.
      </div>
    </footer>
  );
}
