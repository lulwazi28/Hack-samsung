import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search } from 'lucide-react';
import { assignmentsForTeam, assignmentsForJudge, consolidatedScore } from '../../lib/scoring.js';
import { RUBRIC_TOTAL } from '../../data/rubric.js';
import CircularProgress from '../shared/CircularProgress.jsx';
import StatusPill from '../shared/StatusPill.jsx';

const FILTERS = ['All teams', 'Not submitted', 'Judging incomplete', 'Fully judged'];

export default function Judging() {
  const { teams, judges, assignments } = useOutletContext();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All teams');

  const totalAssignments = assignments.length;
  const doneAssignments = assignments.filter((a) => a.status === 'submitted').length;
  const inProgress = totalAssignments - doneAssignments;
  const donePct = totalAssignments ? Math.round((doneAssignments / totalAssignments) * 100) : 0;
  const pendingPct = 100 - donePct;

  const rows = useMemo(() => {
    return teams
      .map((t) => {
        const teamAssignments = assignmentsForTeam(assignments, t.id);
        const done = teamAssignments.filter((a) => a.status === 'submitted').length;
        return {
          ...t,
          reviewersTotal: teamAssignments.length,
          reviewersDone: done,
          fullyJudged: teamAssignments.length > 0 && done === teamAssignments.length,
          score: consolidatedScore(assignments, t.id),
        };
      })
      .filter((t) => {
        const matchesSearch = !search.trim() || t.name.toLowerCase().includes(search.trim().toLowerCase());
        const matchesFilter =
          filter === 'All teams' ||
          (filter === 'Not submitted' && !t.submitted) ||
          (filter === 'Judging incomplete' && t.submitted && !t.fullyJudged) ||
          (filter === 'Fully judged' && t.fullyJudged);
        return matchesSearch && matchesFilter;
      });
  }, [teams, assignments, search, filter]);

  const judgeRows = judges.map((j) => {
    const ja = assignmentsForJudge(assignments, j.id);
    const done = ja.filter((a) => a.status === 'submitted').length;
    return { ...j, total: ja.length, done, pending: ja.length - done };
  });

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-2xl font-semibold mb-1">Judging Progress</h1>
      <p className="text-sm text-muted mb-6">Track progress, submissions and evaluation status.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-muted uppercase tracking-wide font-display font-semibold mb-2">Total teams</p>
          <p className="font-display text-3xl tabular-nums">{teams.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <CircularProgress value={doneAssignments} max={totalAssignments} centerText={`${donePct}%`} color="#16A34A" size={64} stroke={7} />
          <div>
            <p className="font-display text-lg font-semibold tabular-nums">{doneAssignments}</p>
            <p className="text-xs text-muted">Completed</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <CircularProgress value={inProgress} max={totalAssignments} centerText={`${pendingPct}%`} color="#D97706" size={64} stroke={7} />
          <div>
            <p className="font-display text-lg font-semibold tabular-nums">{inProgress}</p>
            <p className="text-xs text-muted">In Progress</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-muted uppercase tracking-wide font-display font-semibold mb-2">Not submitted</p>
          <p className="font-display text-3xl tabular-nums">{teams.filter((t) => !t.submitted).length}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by team name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-border rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-white border border-border rounded-md px-3 py-2 text-sm text-muted outline-none focus:ring-2 focus:ring-primary/30">
          {FILTERS.map((f) => <option key={f}>{f}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted uppercase tracking-wide">
              <th className="px-5 py-3 font-display font-semibold">Team</th>
              <th className="px-5 py-3 font-display font-semibold">Submission</th>
              <th className="px-5 py-3 font-display font-semibold">Judging Status</th>
              <th className="px-5 py-3 font-display font-semibold">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-6 text-muted">No teams match your search or filter.</td></tr>
            )}
            {rows.map((t) => (
              <tr key={t.id}>
                <td className="px-5 py-3.5 font-display font-medium">{t.name}</td>
                <td className="px-5 py-3.5"><StatusPill tone={t.submitted ? 'success' : 'danger'}>{t.submitted ? 'Complete' : 'Not submitted'}</StatusPill></td>
                <td className="px-5 py-3.5">
                  <StatusPill tone={t.fullyJudged ? 'success' : t.reviewersDone > 0 ? 'warning' : 'neutral'}>
                    {t.fullyJudged ? 'Completed' : t.reviewersDone > 0 ? 'In Progress' : 'Pending'}
                  </StatusPill>
                </td>
                <td className="px-5 py-3.5 tabular-nums text-muted">
                  {t.score !== null ? `${t.score}/${RUBRIC_TOTAL}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="font-display text-lg font-semibold mb-3">Judge workload</h2>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted uppercase tracking-wide">
              <th className="px-5 py-3 font-display font-semibold">Judge</th>
              <th className="px-5 py-3 font-display font-semibold">Assigned</th>
              <th className="px-5 py-3 font-display font-semibold">Completed</th>
              <th className="px-5 py-3 font-display font-semibold">Outstanding</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {judgeRows.map((j) => (
              <tr key={j.id}>
                <td className="px-5 py-3 font-display">{j.code}</td>
                <td className="px-5 py-3 tabular-nums text-muted">{j.total}</td>
                <td className="px-5 py-3 tabular-nums text-muted">{j.done}</td>
                <td className="px-5 py-3 tabular-nums">
                  {j.pending > 0 ? <span className="text-warning">{j.pending}</span> : <span className="text-muted">0</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
