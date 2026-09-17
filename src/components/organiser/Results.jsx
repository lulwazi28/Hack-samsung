import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Download, Trophy } from 'lucide-react';
import { rankedTeams, judgingProgress } from '../../lib/scoring.js';
import { RUBRIC, RUBRIC_TOTAL } from '../../data/rubric.js';
import BarRow from '../shared/BarRow.jsx';

const TABS = ['Overall Ranking', 'By Criterion', 'Visualisations'];
const MEDAL_COLORS = ['#D4A017', '#9CA3AF', '#B45309'];

// Teams are scored on a single total per judge, so per-criterion figures here are
// estimated proportionally from that total for visualization — connect real
// per-criterion scoring data to make this exact.
function estimateCriterionScore(total, criterion) {
  if (total === null) return null;
  return Math.round(total * (criterion.max / RUBRIC_TOTAL) * 10) / 10;
}

function exportCSV(ranked) {
  const header = ['Rank', 'Team', 'Code', 'Score', 'Reviewers completed', 'Reviewers assigned'];
  const rows = ranked.map((t, i) => [
    t.score !== null ? i + 1 : '—', t.name, t.code, t.score !== null ? t.score : '', t.reviewersDone, t.reviewersTotal,
  ]);
  const csv = [header, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hackjudge-results.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Results() {
  const { teams, assignments } = useOutletContext();
  const [tab, setTab] = useState('Overall Ranking');
  const ranked = rankedTeams(teams, assignments);
  const { total, done } = judgingProgress(assignments);
  const isFinal = total > 0 && done === total;
  const podium = ranked.filter((t) => t.score !== null).slice(0, 3);
  const scored = ranked.filter((t) => t.score !== null);

  const criterionAverages = RUBRIC.map((c) => {
    const values = scored.map((t) => estimateCriterionScore(t.score, c)).filter((v) => v !== null);
    const avg = values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
    return { ...c, avg: Math.round(avg * 10) / 10 };
  });

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between gap-4 mb-1">
        <h1 className="font-display text-2xl font-semibold">Final Results</h1>
        <button
          type="button"
          onClick={() => exportCSV(ranked)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md font-display text-sm font-semibold text-white bg-primary hover:bg-primarydark transition-colors shrink-0"
        >
          <Download className="h-4 w-4" />
          Export Results
        </button>
      </div>
      <p className="text-sm text-muted mb-6">
        {isFinal ? `All ${total} evaluations are in — results are final.` : `${done}/${total} evaluations submitted — scores are provisional.`}
      </p>

      <div className="flex gap-1 bg-app border border-border rounded-md p-1 w-fit mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3.5 py-1.5 rounded text-sm font-display whitespace-nowrap transition-colors ${
              tab === t ? 'bg-white text-ink shadow-card' : 'text-muted hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overall Ranking' && (
        <>
          {podium.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {podium.map((t, i) => (
                <div key={t.id} className="bg-card border border-border rounded-xl p-5">
                  <span className="inline-flex h-7 w-7 rounded-full items-center justify-center mb-3" style={{ backgroundColor: `${MEDAL_COLORS[i]}22` }}>
                    <Trophy className="h-4 w-4" style={{ color: MEDAL_COLORS[i] }} />
                  </span>
                  <p className="font-display font-semibold truncate">{t.name}</p>
                  <p className="text-xs text-muted mb-2">{t.code}</p>
                  <p className="font-display text-2xl tabular-nums">{t.score}<span className="text-sm text-muted">/{RUBRIC_TOTAL}</span></p>
                </div>
              ))}
            </div>
          )}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted uppercase tracking-wide">
                  <th className="px-5 py-3 font-display font-semibold">Rank</th>
                  <th className="px-5 py-3 font-display font-semibold">Team</th>
                  <th className="px-5 py-3 font-display font-semibold">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ranked.map((t, i) => (
                  <tr key={t.id}>
                    <td className="px-5 py-3.5 tabular-nums text-muted">{t.score !== null ? i + 1 : '—'}</td>
                    <td className="px-5 py-3.5 font-display font-medium">{t.name}</td>
                    <td className="px-5 py-3.5 tabular-nums">{t.score !== null ? `${t.score}/${RUBRIC_TOTAL}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'By Criterion' && (
        <div className="bg-card border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted uppercase tracking-wide">
                <th className="px-5 py-3 font-display font-semibold sticky left-0 bg-card">Team</th>
                {RUBRIC.map((c) => <th key={c.id} className="px-4 py-3 font-display font-semibold whitespace-nowrap">{c.label}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {scored.map((t) => (
                <tr key={t.id}>
                  <td className="px-5 py-3 font-display font-medium sticky left-0 bg-card">{t.name}</td>
                  {RUBRIC.map((c) => (
                    <td key={c.id} className="px-4 py-3 tabular-nums text-muted">{estimateCriterionScore(t.score, c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Visualisations' && (
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="font-display font-semibold text-sm text-muted uppercase tracking-wide mb-5">Performance by criterion</p>
          <div className="space-y-4">
            {criterionAverages.map((c) => (
              <BarRow key={c.id} label={c.label} value={c.avg} max={c.max} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
