import { useEffect, useState } from "react";
import { getAllInquiries, updateInquiry, deleteInquiry } from "../../services/operationsService";
import { useToast } from "../../context/ToastContext";
import Loading from "../../components/Loading";

export default function Inquiries() {
  const { addToast } = useToast();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const load = () => {
    setLoading(true);
    getAllInquiries({ status: filter })
      .then(setInquiries)
      .catch(() => setInquiries([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filter]);

  const handleStatus = async (id, status) => {
    try {
      await updateInquiry(id, { status });
      addToast(`Inquiry marked ${status}`);
      load();
    } catch {
      addToast("Could not update inquiry", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this inquiry?")) return;
    try {
      await deleteInquiry(id);
      addToast("Inquiry deleted", "info");
      load();
    } catch {
      addToast("Delete failed", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink">Guest Inquiries</h1>
          <p className="text-xs text-stone-500">Messages submitted via the Atithya Contact &amp; Events form</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-sm"
        >
          <option value="All">All Statuses</option>
          <option value="New">New</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {loading ? (
        <Loading text="Loading guest messages..." />
      ) : inquiries.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 text-sm text-stone-500">
          No inquiries found.
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <div key={inq._id} className="bg-white rounded-2xl p-5 border border-stone-200/80 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-soft text-primary text-[11px] font-semibold">
                    {inq.subject}
                  </span>
                  <h3 className="font-bold text-ink mt-1">
                    {inq.name} <span className="text-xs font-normal text-stone-500">({inq.email} {inq.phone && `· ${inq.phone}`})</span>
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={inq.status}
                    onChange={(e) => handleStatus(inq._id, e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold"
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  <button
                    onClick={() => handleDelete(inq._id)}
                    className="text-xs text-red-600 font-semibold hover:underline px-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-sm text-stone-700 leading-relaxed">{inq.message}</p>
              <p className="text-[11px] text-stone-400">
                Received {new Date(inq.createdAt).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
