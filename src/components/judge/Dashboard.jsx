import { Link, useOutletContext } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CircularProgress from '../shared/CircularProgress.jsx';
import StatusPill from '../shared/StatusPill.jsx';

export default function Dashboard() {
  const { judge, teams } = useOutletContext();
  const completed = teams.filter((t) => t.status === 'submitted').length;
  const remaining = teams.length - completed;

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-semibold mb-1">Welcome, Judge {judge.judgeId} 👋</h1>
      <p className="text-sm text-muted mb-8">Here are your assigned projects.</p>

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-center bg-card border border-border rounded-xl p-6 mb-6">
        <CircularProgress value={completed} max={teams.length} label="Workload" />
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
          <div>
            <p className="text-xs text-muted mb-1">Evaluated</p>
            <p className="font-display text-2xl font-semibold tabular-nums">{completed}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Remaining</p>
            <p className="font-display text-2xl font-semibold tabular-nums">{remaining}</p>
          </div>
          <Link
            to="/judge/evaluations"
            className="inline-flex items-center gap-1.5 text-sm font-display text-primary hover:underline self-center sm:ml-auto"
          >
            View all evaluations
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {teams.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="font-display text-sm font-medium truncate">{t.name}</p>
              <p className="text-xs text-muted truncate">{t.oneLiner}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <StatusPill tone={t.status === 'submitted' ? 'success' : t.status === 'in-progress' ? 'warning' : 'neutral'}>
                {t.status === 'submitted' ? 'Completed' : t.status === 'in-progress' ? 'In Progress' : 'Not Started'}
              </StatusPill>
              <Link
                to={`/judge/team/${t.id}`}
                className="text-sm font-display px-3.5 py-1.5 rounded-md bg-primary text-white hover:bg-primarydark transition-colors"
              >
                Review
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
