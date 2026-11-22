import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { checkTableAvailability, createReservation } from "../../services/reservationService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const TIME_SLOTS = [
  "12:00",
  "13:00",
  "14:00",
  "18:30",
  "19:30",
  "20:30",
  "21:30",
];
const ZONES = ["All", "Indoor", "Outdoor", "Rooftop", "VIP Lounge"];
const OCCASIONS = [
  "None",
  "Birthday",
  "Anniversary",
  "Business Dinner",
  "Family Gathering",
  "Date Night",
];

export default function BookTable() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [timeSlot, setTimeSlot] = useState("19:30");
  const [partySize, setPartySize] = useState(2);
  const [zone, setZone] = useState("All");

  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [checking, setChecking] = useState(false);

  const [guestName, setGuestName] = useState(user?.name || "");
  const [guestEmail, setGuestEmail] = useState(user?.email || "");
  const [guestPhone, setGuestPhone] = useState(user?.phone || "");
  const [occasion, setOccasion] = useState("None");
  const [specialRequests, setSpecialRequests] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  useEffect(() => {
    setChecking(true);
    setSelectedTableId("");
    checkTableAvailability({ date, timeSlot, partySize, zone })
      .then((res) => setAvailableTables(res.tables || []))
      .catch(() => setAvailableTables([]))
      .finally(() => setChecking(false));
  }, [date, timeSlot, partySize, zone]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (availableTables.length === 0) {
      addToast("No tables available for this slot. Try another time or zone.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const booking = await createReservation({
        guestName,
        guestEmail,
        guestPhone,
        tableId: selectedTableId || availableTables[0]._id,
        date,
        timeSlot,
        partySize,
        zone: zone === "All" ? availableTables[0].zone : zone,
        occasion,
        specialRequests,
      });
      setConfirmed(booking);
      addToast(`Table ${booking.table?.tableNumber} reserved! Code: ${booking.bookingCode}`);
    } catch (err) {
      addToast(err.response?.data?.message || "Reservation failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-soft text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 text-3xl flex items-center justify-center mx-auto">
            ✓
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mt-5">
            Reservation Confirmed
          </p>
          <h1 className="text-3xl font-serif font-bold text-ink mt-1">
            We Look Forward to Hosting You
          </h1>
          <p className="mt-3 font-mono text-lg font-bold text-obsidian bg-amber-50 border border-amber-200 inline-block px-5 py-2 rounded-xl">
            {confirmed.bookingCode}
          </p>

          <div className="mt-6 bg-stone-50 rounded-2xl p-5 text-left text-sm space-y-2 border border-stone-100">
            <p><strong>Guest:</strong> {confirmed.guestName}</p>
            <p><strong>Date &amp; Time:</strong> {confirmed.date} at {confirmed.timeSlot}</p>
            <p><strong>Party Size:</strong> {confirmed.partySize} Guest(s)</p>
            <p>
              <strong>Assigned Table:</strong> {confirmed.table?.tableNumber} ({confirmed.table?.name} · {confirmed.table?.zone})
            </p>
            {confirmed.occasion !== "None" && (
              <p><strong>Occasion:</strong> {confirmed.occasion}</p>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-7">
            {user && (
              <Link
                to="/reservations"
                className="px-6 py-3 rounded-full bg-obsidian text-white text-sm font-semibold hover:bg-primary transition"
              >
                View My Reservations
              </Link>
            )}
            <button
              onClick={() => setConfirmed(null)}
              className="px-6 py-3 rounded-full border border-stone-300 text-sm font-semibold text-stone-700 hover:bg-stone-50"
            >
              Book Another Table
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Atithya Concierge
        </p>
        <h1 className="text-4xl font-serif font-bold text-ink mt-2">
          Reserve Your Table
        </h1>
        <p className="text-stone-500 mt-2 text-sm">
          Choose your date, dining zone, and preferred table with real-time slot verification.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-8">
        {/* Step 1: Slot & Table Selection */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 space-y-5">
            <h2 className="text-lg font-bold text-ink">1. Select Date, Time &amp; Zone</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-500">Date</label>
                <input
                  type="date"
                  min={today}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-500">Guests</label>
                <select
                  value={partySize}
                  onChange={(e) => setPartySize(Number(e.target.value))}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-500">Dining Zone</label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
                >
                  {ZONES.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500">Time Slot</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                      timeSlot === slot
                        ? "bg-primary text-white border-primary"
                        : "bg-stone-50 text-stone-700 border-stone-200 hover:border-primary"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Available Tables */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-ink">2. Pick an Available Table</h2>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                {checking ? "Checking..." : `${availableTables.length} available`}
              </span>
            </div>

            {checking ? (
              <p className="text-sm text-stone-400 py-6 text-center">Checking live floor availability...</p>
            ) : availableTables.length === 0 ? (
              <div className="p-6 rounded-2xl bg-red-50 text-red-700 text-sm text-center">
                No tables available for {partySize} guests on {date} at {timeSlot}. Please try another time slot or dining zone.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {availableTables.map((t) => {
                  const selected =
                    selectedTableId === t._id || (!selectedTableId && availableTables[0]._id === t._id);
                  return (
                    <button
                      key={t._id}
                      type="button"
                      onClick={() => setSelectedTableId(t._id)}
                      className={`text-left p-4 rounded-2xl border transition ${
                        selected
                          ? "border-primary bg-primary-soft/60 ring-1 ring-primary"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-ink">{t.tableNumber}</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white border border-stone-200">
                          {t.zone}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-stone-700 mt-1">{t.name}</p>
                      <p className="text-xs text-stone-500 mt-0.5">Up to {t.capacity} guests</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Guest Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 space-y-4 sticky top-24">
            <h2 className="text-lg font-bold text-ink">3. Guest Details</h2>
            <div>
              <label className="text-xs font-semibold text-stone-500">Full Name</label>
              <input
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Your full name"
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500">Email</label>
              <input
                required
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500">Phone</label>
              <input
                required
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500">Special Occasion</label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
              >
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500">Special Requests</label>
              <textarea
                rows="2"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="High chair, quiet corner, anniversary cake..."
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || availableTables.length === 0}
              className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition shadow-glow disabled:opacity-40"
            >
              {submitting ? "Confirming Table..." : "Confirm Table Reservation"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
