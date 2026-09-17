import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function AuditTrail() {
  const { auditLog } = useOutletContext();
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState('All Users');
  const [actionFilter, setActionFilter] = useState('All Actions');

  const users = ['All Users', ...new Set(auditLog.map((l) => l.user))];
  const actions = ['All Actions', ...new Set(auditLog.map((l) => l.action))];

  const rows = useMemo(() => {
    return auditLog.filter((l) => {
      const matchesSearch = !search.trim() || l.details.toLowerCase().includes(search.trim().toLowerCase());
      const matchesUser = userFilter === 'All Users' || l.user === userFilter;
      const matchesAction = actionFilter === 'All Actions' || l.action === actionFilter;
      return matchesSearch && matchesUser && matchesAction;
    });
  }, [auditLog, search, userFilter, actionFilter]);

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-semibold mb-1">Audit Trail</h1>
      <p className="text-sm text-muted mb-6">Record of what was submitted, who submitted it, and when.</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-border rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="bg-white border border-border rounded-md px-3 py-2 text-sm text-muted outline-none focus:ring-2 focus:ring-primary/30">
          {users.map((u) => <option key={u}>{u}</option>)}
        </select>
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="bg-white border border-border rounded-md px-3 py-2 text-sm text-muted outline-none focus:ring-2 focus:ring-primary/30">
          {actions.map((a) => <option key={a}>{a}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted uppercase tracking-wide">
              <th className="px-5 py-3 font-display font-semibold">Date & Time</th>
              <th className="px-5 py-3 font-display font-semibold">User</th>
              <th className="px-5 py-3 font-display font-semibold">Action</th>
              <th className="px-5 py-3 font-display font-semibold">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-6 text-muted">No log entries match your search or filters.</td></tr>
            )}
            {rows.map((l, i) => {
              const timeObj = new Date(l.time);
              return (
              <tr key={i}>
                <td className="px-5 py-3 tabular-nums text-muted whitespace-nowrap">
                  {timeObj.toLocaleDateString([], { day: '2-digit', month: 'short' })}, {timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-5 py-3 font-display">{l.user}</td>
                <td className="px-5 py-3">{l.action}</td>
                <td className="px-5 py-3 text-muted">{l.details}</td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
