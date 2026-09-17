import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';

const MEDAL_COLORS = ['#D4A017', '#9CA3AF', '#B45309'];

const DEFAULT_BOARD = [
  { rank: 1, name: 'Team Aurora', score: 92.5 },
  { rank: 2, name: 'Team Kestrel', score: 89.0 },
  { rank: 3, name: 'Team Loom', score: 86.7 },
  { rank: 4, name: 'Team Ferrous', score: 84.2 },
  { rank: 5, name: 'Team Halcyon', score: 81.5 },
];

export default function Leaderboard() {
  const { team } = useOutletContext();
  const [board, setBoard] = useState(DEFAULT_BOARD);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const { data: teamsData } = await supabase.from('teams').select('*');
        const { data: assignData } = await supabase.from('assignments').select('*');

        if (teamsData && teamsData.length > 0) {
          const scoreMap = new Map();
          (assignData || []).forEach((a) => {
            const current = scoreMap.get(a.team_id) || [];
            current.push(Number(a.total_score) || 0);
            scoreMap.set(a.team_id, current);
          });

          const ranked = teamsData
            .map((t) => {
              const scores = scoreMap.get(t.id) || [0];
              const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
              return {
                id: t.id,
                name: t.name,
                score: avgScore,
              };
            })
            .sort((a, b) => b.score - a.score)
            .map((item, idx) => ({
              rank: idx + 1,
              name: item.name,
              score: item.score,
            }));

          setBoard(ranked.length > 0 ? ranked : DEFAULT_BOARD);
        }
      } catch (err) {
        console.warn('Using default leaderboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  const yourRow = board.find((b) => b.name === team?.name) || { rank: board.length + 1, name: team?.name || 'Your Team', score: 0 };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold">Leaderboard</h1>
        <select className="text-sm bg-white border border-border rounded-md px-3 py-1.5 text-muted outline-none focus:ring-2 focus:ring-primary/30">
          <option>Overall</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-sm text-muted">Calculating leaderboard rankings...</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted uppercase tracking-wide">
                  <th className="px-5 py-3 font-display font-semibold w-16">#</th>
                  <th className="px-5 py-3 font-display font-semibold">Team</th>
                  <th className="px-5 py-3 font-display font-semibold text-right">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {board.map((row) => (
                  <tr key={row.rank}>
                    <td className="px-5 py-3.5">
                      {row.rank <= 3 ? (
                        <span
                          className="inline-flex h-6 w-6 rounded-full items-center justify-center"
                          style={{ backgroundColor: `${MEDAL_COLORS[row.rank - 1]}22` }}
                        >
                          <Trophy className="h-3.5 w-3.5" style={{ color: MEDAL_COLORS[row.rank - 1] }} />
                        </span>
                      ) : (
                        <span className="text-muted tabular-nums">{row.rank}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-display font-medium">{row.name}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums">{row.score.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t-2 border-primary/20 bg-primarylight/60">
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="px-5 py-3.5 w-16 text-primary tabular-nums font-display font-semibold">{yourRow.rank}</td>
                    <td className="px-5 py-3.5 font-display font-semibold text-primary">{yourRow.name}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums font-display font-semibold text-primary">
                      {yourRow.score.toFixed(1)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
