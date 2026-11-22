import { useState } from "react";
import { submitContactInquiry } from "../../services/operationsService";
import { useToast } from "../../context/ToastContext";

export default function Contact() {
  const { addToast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitContactInquiry(form);
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", subject: "General Inquiry", message: "" });
      addToast("Your message has been received by Atithya Concierge!");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to send message", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center max-w-xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Atithya Concierge
        </p>
        <h1 className="text-4xl font-serif font-bold text-ink mt-2">
          We'd Love to Hear From You
        </h1>
        <p className="text-stone-500 mt-3 text-sm">
          Private dining inquiries, catering requests, feedback, or special event bookings — our team responds promptly.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10 mt-12">
        <div className="bg-obsidian text-white rounded-3xl p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold">Get in Touch</h2>
            <p className="text-stone-400 mt-3 text-sm leading-relaxed">
              Reach out to our hospitality desk any day of the week between 11:30 AM and 11:30 PM.
            </p>

            <div className="mt-8 space-y-6 text-sm">
              <div>
                <p className="text-amber-400 text-xs uppercase tracking-wider font-semibold">Email</p>
                <p className="mt-1">concierge@atithya.com</p>
              </div>
              <div>
                <p className="text-amber-400 text-xs uppercase tracking-wider font-semibold">Phone</p>
                <p className="mt-1">+91 98765 43210</p>
              </div>
              <div>
                <p className="text-amber-400 text-xs uppercase tracking-wider font-semibold">Flagship Location</p>
                <p className="mt-1">24 Park Mansion, Park Street, Kolkata, West Bengal 700016</p>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-stone-800 text-xs text-stone-400">
            Valet parking available · Wheelchair accessible · Private dining suites for up to 24 guests.
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-stone-200/80 rounded-3xl p-8 shadow-soft space-y-4"
        >
          <h2 className="text-2xl font-serif font-bold text-ink">Send a Message</h2>

          {submitted && (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
              Thank you! Your inquiry has been logged with our team and we'll get back to you shortly.
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-500">Full Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="w-full mt-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full mt-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-500">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full mt-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-500">Subject</label>
            <select
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full mt-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-primary"
            >
              <option>General Inquiry</option>
              <option>Private Event / Banquet</option>
              <option>Catering Request</option>
              <option>Order / Dining Feedback</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-500">Message</label>
            <textarea
              required
              rows="4"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Tell us how we can make your experience memorable..."
              className="w-full mt-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition shadow-glow disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}