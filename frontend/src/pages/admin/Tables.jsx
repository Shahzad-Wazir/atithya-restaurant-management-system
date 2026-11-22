import { useEffect, useState } from "react";
import { getTables, createTable, updateTable, deleteTable } from "../../services/reservationService";
import { useToast } from "../../context/ToastContext";
import Loading from "../../components/Loading";

const ZONES = ["Indoor", "Outdoor", "Rooftop", "VIP Lounge"];
const TABLE_STATUSES = ["Available", "Reserved", "Occupied", "Maintenance"];

const STATUS_STYLE = {
  Available: "border-emerald-300 bg-emerald-50/50",
  Reserved: "border-amber-300 bg-amber-50/60",
  Occupied: "border-red-300 bg-red-50/60",
  Maintenance: "border-stone-300 bg-stone-100",
};

export default function Tables() {
  const { addToast } = useToast();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ tableNumber: "", name: "", capacity: 4, zone: "Indoor" });

  const load = () => {
    setLoading(true);
    getTables()
      .then(setTables)
      .catch(() => setTables([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createTable(form);
      setForm({ tableNumber: "", name: "", capacity: 4, zone: "Indoor" });
      addToast("New dining table added");
      load();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to add table", "error");
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await updateTable(id, { status });
      addToast(`Table status → ${status}`);
      load();
    } catch {
      addToast("Could not update table", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this table from the floor plan?")) return;
    try {
      await deleteTable(id);
      addToast("Table removed", "info");
      load();
    } catch {
      addToast("Could not delete table", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-ink">Floor &amp; Table Management</h1>
        <p className="text-xs text-stone-500">Configure dining tables across zones and monitor live occupancy</p>
      </div>

      {/* Add Table Form */}
      <form
        onSubmit={handleCreate}
        className="bg-white rounded-2xl p-5 border border-stone-200/80 grid sm:grid-cols-5 gap-3 items-end"
      >
        <div>
          <label className="text-xs font-semibold text-stone-500">Table #</label>
          <input
            required
            value={form.tableNumber}
            onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}
            placeholder="T-10"
            className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-500">Display Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Lotus Corner"
            className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-500">Capacity</label>
          <input
            type="number"
            min={1}
            max={24}
            required
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
            className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-500">Zone</label>
          <select
            value={form.zone}
            onChange={(e) => setForm({ ...form, zone: e.target.value })}
            className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
          >
            {ZONES.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="py-2.5 px-4 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition"
        >
          + Add Table
        </button>
      </form>

      {loading ? (
        <Loading text="Loading floor map..." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((t) => (
            <div
              key={t._id}
              className={`rounded-2xl p-5 border-2 transition ${STATUS_STYLE[t.status] || "bg-white border-stone-200"}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono font-bold text-lg text-ink">{t.tableNumber}</span>
                  <p className="text-sm font-medium text-stone-700">{t.name}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-[11px] font-semibold border border-stone-200">
                  {t.zone}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">Seats up to {t.capacity} guests</p>

              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-black/5">
                <select
                  value={t.status}
                  onChange={(e) => handleStatus(t._id, e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-stone-200 bg-white text-xs font-semibold outline-none"
                >
                  {TABLE_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleDelete(t._id)}
                  className="text-xs text-red-600 hover:underline font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
