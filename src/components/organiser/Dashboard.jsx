import { Link, useOutletContext } from 'react-router-dom';
import { Settings, Gavel, Trophy, ArrowRight, Activity, Users, ShieldCheck } from 'lucide-react';
import { judgingProgress } from '../../lib/scoring.js';

export default function Dashboard() {
  const { teams, judges, assignments, organiser, activeWorkspace, auditLog } = useOutletContext();
  const submitted = teams.filter((t) => t.submitted).length;
  const { total, done } = judgingProgress(assignments);

  const cards = [
    { to: '/organiser/setup', icon: Settings, label: 'Competition Setup', sub: `${teams.length} teams · ${judges.length} judges` },
    { to: '/organiser/judging', icon: Gavel, label: 'Judging & Scoring', sub: `${done}/${total || 1} evaluations complete` },
    { to: '/organiser/results', icon: Trophy, label: 'Results & Leaderboard', sub: 'View rankings & export' },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded bg-primarylight text-primary text-xs font-semibold uppercase tracking-wider">
            Workspace Active
          </span>
        </div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Welcome back, {organiser.email.split('@')[0]} 👋
        </h1>
        <p className="text-sm text-muted">Live snapshot for <strong>{activeWorkspace?.name || 'Autumn Build 2026'}</strong>.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <p className="text-xs text-muted uppercase tracking-wide font-display font-semibold mb-1">Total Teams</p>
          <p className="font-display text-2xl font-bold text-ink tabular-nums">{teams.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <p className="text-xs text-muted uppercase tracking-wide font-display font-semibold mb-1">Assigned Judges</p>
          <p className="font-display text-2xl font-bold text-ink tabular-nums">{judges.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <p className="text-xs text-muted uppercase tracking-wide font-display font-semibold mb-1">Projects Submitted</p>
          <p className="font-display text-2xl font-bold text-ink tabular-nums">{submitted}/{teams.length || 1}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <p className="text-xs text-muted uppercase tracking-wide font-display font-semibold mb-1">Evaluations Done</p>
          <p className="font-display text-2xl font-bold text-ink tabular-nums">{done}/{total || 1}</p>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all shadow-sm group flex flex-col justify-between"
          >
            <div>
              <c.icon className="h-5 w-5 text-primary mb-3" />
              <p className="font-display font-semibold text-ink text-base mb-1">{c.label}</p>
              <p className="text-xs text-muted mb-4">{c.sub}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-display font-semibold text-primary">
              Open <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        ))}
      </div>

      {/* Recent Activity Log */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-sm text-ink flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Live Audit Log Feed
          </h2>
          <Link to="/organiser/audit-trail" className="text-xs font-semibold text-primary hover:underline">
            View full audit trail →
          </Link>
        </div>

        {auditLog.length === 0 ? (
          <p className="text-xs text-muted">No audit activity logged for this workspace yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {auditLog.slice(0, 4).map((item, idx) => (
              <li key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-ink">{item.action}</span>
                  <span className="text-muted ml-2">{item.details}</span>
                </div>
                <span className="text-[11px] text-muted">{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
