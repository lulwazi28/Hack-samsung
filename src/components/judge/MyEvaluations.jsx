import { useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Search } from 'lucide-react';
import StatusPill from '../shared/StatusPill.jsx';
import { RUBRIC_TOTAL } from '../../data/rubric.js';

const FILTERS = ['All Status', 'Not Started', 'In Progress', 'Completed'];
const STATUS_MAP = { 'Not Started': 'pending', 'In Progress': 'in-progress', Completed: 'submitted' };

function scoreTotal(scores) {
  return Object.values(scores || {}).reduce((sum, v) => sum + (v || 0), 0);
}

export default function MyEvaluations() {
  const { teams } = useOutletContext();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All Status');

  const filtered = useMemo(() => {
    return teams.filter((t) => {
      const matchesSearch =
        !search.trim() ||
        t.name.toLowerCase().includes(search.trim().toLowerCase()) ||
        t.oneLiner.toLowerCase().includes(search.trim().toLowerCase());
      const matchesFilter = filter === 'All Status' || t.status === STATUS_MAP[filter];
      return matchesSearch && matchesFilter;
    });
  }, [teams, search, filter]);

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-semibold mb-1">My Evaluations</h1>
      <p className="text-sm text-muted mb-6">Search or filter your assigned projects.</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search teams or projects"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-border rounded-md pl-9 pr-3 py-2 text-sm text-ink placeholder:text-muted/60 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white border border-border rounded-md px-3 py-2 text-sm text-muted outline-none focus:ring-2 focus:ring-primary/30"
        >
          {FILTERS.map((f) => <option key={f}>{f}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted uppercase tracking-wide">
              <th className="px-5 py-3 font-display font-semibold">Team / Project</th>
              <th className="px-5 py-3 font-display font-semibold">Status</th>
              <th className="px-5 py-3 font-display font-semibold">Score</th>
              <th className="px-5 py-3 font-display font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-6 text-muted">No teams match your search or filter.</td></tr>
            )}
            {filtered.map((t) => (
              <tr key={t.id}>
                <td className="px-5 py-3.5">
                  <p className="font-display font-medium">{t.name}</p>
                  <p className="text-xs text-muted">{t.oneLiner}</p>
                </td>
                <td className="px-5 py-3.5">
                  <StatusPill tone={t.status === 'submitted' ? 'success' : t.status === 'in-progress' ? 'warning' : 'neutral'}>
                    {t.status === 'submitted' ? 'Completed' : t.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                  </StatusPill>
                </td>
                <td className="px-5 py-3.5 tabular-nums text-muted">
                  {t.status === 'submitted' ? `${scoreTotal(t.scores)}/${RUBRIC_TOTAL}` : '—'}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    to={`/judge/team/${t.id}`}
                    className={`text-sm font-display px-3.5 py-1.5 rounded-md transition-colors ${
                      t.status === 'submitted'
                        ? 'border border-border text-ink hover:bg-app'
                        : 'bg-primary text-white hover:bg-primarydark'
                    }`}
                  >
                    {t.status === 'pending' ? 'Review' : t.status === 'in-progress' ? 'Continue' : 'View'}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
