import { useEffect, useState } from "react";
import { getAllReservations, updateReservationStatus } from "../../services/reservationService";
import { useToast } from "../../context/ToastContext";
import Loading from "../../components/Loading";

const STATUSES = ["Pending", "Confirmed", "Seated", "Completed", "Cancelled", "No-Show"];

export default function Reservations() {
  const { addToast } = useToast();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    getAllReservations({
      status: statusFilter,
      date: dateFilter || undefined,
      search: search.trim() || undefined,
    })
      .then(setReservations)
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [statusFilter, dateFilter, search]);

  const handleStatus = async (id, status) => {
    try {
      await updateReservationStatus(id, status);
      addToast(`Reservation marked ${status}`);
      load();
    } catch {
      addToast("Could not update reservation", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-ink">Table Reservations</h1>
        <p className="text-xs text-stone-500">
          Seating or completing a reservation automatically updates table status on the floor map
        </p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search booking code, guest name, phone..."
          className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
        />
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-stone-200 text-sm outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-stone-200 text-sm outline-none"
        >
          <option value="All">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {dateFilter && (
          <button
            onClick={() => setDateFilter("")}
            className="text-xs text-primary font-semibold px-2"
          >
            Clear Date
          </button>
        )}
      </div>

      {loading ? (
        <Loading text="Loading reservations..." />
      ) : reservations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 text-sm text-stone-500">
          No reservations found for this filter.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200/80 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-500 border-b border-stone-200">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Date &amp; Slot</th>
                <th className="px-4 py-3">Table &amp; Party</th>
                <th className="px-4 py-3">Occasion / Notes</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {reservations.map((r) => (
                <tr key={r._id} className="hover:bg-stone-50/70">
                  <td className="px-4 py-3.5 font-mono font-bold text-xs text-obsidian">
                    {r.bookingCode}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-ink">{r.guestName}</p>
                    <p className="text-xs text-stone-500">{r.guestPhone}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs">
                    <p className="font-semibold text-ink">{r.date}</p>
                    <p className="text-stone-500">{r.timeSlot}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs">
                    <span className="font-mono font-bold text-primary">
                      {r.table?.tableNumber || "-"}
                    </span>{" "}
                    ({r.zone})
                    <p className="text-stone-500">{r.partySize} Guests</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-stone-600 max-w-xs">
                    {r.occasion !== "None" && (
                      <span className="inline-block px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold mr-1">
                        {r.occasion}
                      </span>
                    )}
                    {r.specialRequests || "-"}
                  </td>
                  <td className="px-4 py-3.5">
                    <select
                      value={r.status}
                      onChange={(e) => handleStatus(r._id, e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold bg-white outline-none focus:border-primary"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
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
