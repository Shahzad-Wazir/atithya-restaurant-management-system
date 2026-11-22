import { useEffect, useState } from "react";
import { getUsers, updateUser, deleteUser } from "../../services/userService";
import { useToast } from "../../context/ToastContext";
import Loading from "../../components/Loading";

export default function Users() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getUsers({
      search: search.trim() || undefined,
      role: roleFilter,
    })
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [search, roleFilter]);

  const handleRoleChange = async (id, role) => {
    try {
      await updateUser(id, { role });
      addToast(`Role updated to ${role}`);
      load();
    } catch {
      addToast("Could not update role", "error");
    }
  };

  const handleToggleActive = async (u) => {
    try {
      await updateUser(u._id, { isActive: u.isActive === false });
      addToast(`Account ${u.isActive === false ? "reactivated" : "deactivated"}`);
      load();
    } catch {
      addToast("Could not update account status", "error");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete user "${name}"?`)) return;
    try {
      await deleteUser(id);
      addToast("User deleted", "info");
      load();
    } catch (err) {
      addToast(err.response?.data?.message || "Delete failed", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-ink">Users &amp; Staff Directory</h1>
        <p className="text-xs text-stone-500">Assign Guest, Kitchen Chef, or Admin roles and manage account access</p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="flex-1 min-w-[220px] px-4 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-stone-200 text-sm"
        >
          <option value="All">All Roles</option>
          <option value="user">Guests (user)</option>
          <option value="kitchen">Kitchen Staff</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      {loading ? (
        <Loading text="Loading users..." />
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200/80 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-500 border-b border-stone-200">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-stone-50/70">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{u.name}</p>
                    <p className="text-xs text-stone-500">
                      {u.email} {u.phone && `· ${u.phone}`}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold bg-white"
                    >
                      <option value="user">Customer (user)</option>
                      <option value="kitchen">Kitchen Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(u)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        u.isActive !== false
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {u.isActive !== false ? "Active" : "Suspended"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-stone-500">
                    {new Date(u.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(u._id, u.name)}
                      className="text-xs text-red-600 font-semibold hover:underline"
                    >
                      Delete
                    </button>
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
