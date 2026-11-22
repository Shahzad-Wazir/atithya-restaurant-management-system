import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyReservations, cancelReservation } from "../../services/reservationService";
import { useToast } from "../../context/ToastContext";
import Loading from "../../components/Loading";

const BADGE = {
  Pending: "bg-[#FBF3E2] text-warning",
  Confirmed: "bg-forest-soft text-forest",
  Seated: "bg-espresso text-gold",
  Completed: "bg-stone-200 text-brown",
  Cancelled: "bg-[#FCECEB] text-danger",
  "No-Show": "bg-[#FCECEB] text-danger",
};

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const load = (silent = false) => {
    if (!silent) setLoading(true);
    getMyReservations()
      .then(setReservations)
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // Auto-refresh every 15s & on tab focus so Admin status updates sync live
    const interval = setInterval(() => load(true), 15000);
    const onFocus = () => load(true);
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this table reservation?")) return;
    try {
      await cancelReservation(id);
      addToast("Reservation cancelled", "info");
      load(true);
    } catch (err) {
      addToast(err.response?.data?.message || "Could not cancel", "error");
    }
  };

  if (loading) return <Loading text="Loading your reservations..." />;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-dark">Atithya Dining</p>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brown mt-1">
            My Table Reservations
          </h1>
        </div>
        <Link
          to="/reserve"
          className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition"
        >
          + Book New Table
        </Link>
      </div>

      {reservations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E7DFD3]">
          <p className="text-lg font-semibold text-brown">No reservations found</p>
          <p className="text-sm text-brown/60 mt-1">
            Reserve a table in our Courtyard, Rooftop, or VIP Lounge in seconds.
          </p>
          <Link
            to="/reserve"
            className="inline-block mt-5 px-6 py-2.5 rounded-full bg-espresso text-gold text-sm font-semibold"
          >
            Book a Table
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {reservations.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-3xl p-6 border border-[#E7DFD3] shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-sm text-brown">
                    {r.bookingCode}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${BADGE[r.status] || "bg-ivory text-brown"}`}>
                    {r.status}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-sm text-brown/85">
                  <p><strong>Date &amp; Time:</strong> {r.date} at {r.timeSlot}</p>
                  <p>
                    <strong>Table:</strong> {r.table?.tableNumber || "Assigned"} ({r.table?.name || r.zone} · {r.zone})
                  </p>
                  <p><strong>Party Size:</strong> {r.partySize} Guests</p>
                  {r.occasion && r.occasion !== "None" && (
                    <p><strong>Occasion:</strong> {r.occasion}</p>
                  )}
                  {r.specialRequests && (
                    <p className="text-xs text-brown/60 italic mt-2">“{r.specialRequests}”</p>
                  )}
                </div>
              </div>

              {["Pending", "Confirmed"].includes(r.status) && (
                <div className="mt-5 pt-4 border-t border-[#EFE8DC] flex justify-end">
                  <button
                    onClick={() => handleCancel(r._id)}
                    className="text-xs font-semibold text-danger hover:underline"
                  >
                    Cancel Reservation
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
