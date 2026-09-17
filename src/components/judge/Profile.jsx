import { useOutletContext } from 'react-router-dom';

export default function Profile() {
  const { judge, teams } = useOutletContext();

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl font-semibold mb-6">Profile</h1>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="h-14 w-14 rounded-full bg-primary text-white flex items-center justify-center font-display text-lg font-semibold">
            {judge.judgeId.slice(-2)}
          </div>
          <div>
            <p className="font-display text-lg font-semibold">Judge {judge.judgeId}</p>
            <p className="text-sm text-muted">Autumn Build 2026</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted mb-1">Teams assigned</p>
            <p>{teams.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Evaluations complete</p>
            <p>{teams.filter((t) => t.status === 'submitted').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
