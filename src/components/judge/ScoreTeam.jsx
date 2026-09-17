import { useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { RUBRIC, RUBRIC_TOTAL } from '../../data/rubric.js';
import StatusPill from '../shared/StatusPill.jsx';

const DESCRIPTIONS = {
  innovation: 'How unique and creative is the solution?',
  problem: 'How well does it address a real, important problem?',
  technical: 'How solid and well-built is the implementation?',
  functionality: 'Does the solution work reliably as intended?',
  ux: 'How clear, polished, and usable is the experience?',
  scalability: 'Could this grow or be reused beyond the hackathon?',
};

const TABS = ['Rubric', 'Project Preview', 'Comments'];

function ScoreRow({ index, criterion, value, onChange, disabled }) {
  const options = Array.from({ length: criterion.max + 1 }, (_, i) => i);
  return (
    <div className="py-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-display font-medium text-ink">{index}. {criterion.label}</p>
        <p className="text-xs text-muted mt-0.5">{DESCRIPTIONS[criterion.id]}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex gap-1.5">
          {options.map((n) => (
            <button
              key={n}
              type="button"
              disabled={disabled}
              onClick={() => onChange(n)}
              className={`h-8 w-8 rounded-md text-sm font-display transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                value === n ? 'bg-primary text-white' : 'border border-border text-muted hover:border-primary/50'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted tabular-nums w-10 text-right">/ {criterion.max}</span>
      </div>
    </div>
  );
}

export default function ScoreTeam() {
  const { teamId } = useParams();
  const { teams, updateTeam } = useOutletContext();
  const team = teams.find((t) => t.id === teamId);

  const [tab, setTab] = useState('Rubric');
  const [scores, setScores] = useState(team?.scores || {});
  const [comments, setComments] = useState(team?.comments || '');
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [savedAt, setSavedAt] = useState(team?.savedAt || null);

  if (!team) {
    return (
      <div className="max-w-2xl">
        <p className="text-sm text-muted mb-4">That team isn't in your assigned list.</p>
        <Link to="/judge/evaluations" className="text-sm font-display text-primary hover:underline">
          Back to my evaluations
        </Link>
      </div>
    );
  }

  const locked = team.status === 'submitted';
  const total = RUBRIC.reduce((sum, c) => sum + (scores[c.id] || 0), 0);
  const allScored = RUBRIC.every((c) => scores[c.id] !== undefined);

  function handleScoreChange(criterionId, value) {
    setScores((s) => ({ ...s, [criterionId]: value }));
    setConfirming(false);
  }

  function handleSaveProgress() {
    const now = new Date();
    setSavedAt(now);
    updateTeam(team.id, { scores, comments, savedAt: now, status: allScored ? team.status : 'in-progress' });
  }

  function handleRequestSubmit() {
    if (!allScored) {
      setError('Score every criterion before submitting.');
      return;
    }
    setError('');
    setConfirming(true);
  }

  function handleConfirmSubmit() {
    const now = new Date();
    updateTeam(team.id, { scores, comments, status: 'submitted', submittedAt: now, savedAt: now });
    setSavedAt(now);
    setConfirming(false);
  }

  return (
    <div className="max-w-2xl">
      <Link to="/judge/evaluations" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-4">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Dashboard
      </Link>

      <div className="flex items-start justify-between gap-4 mb-1">
        <h1 className="font-display text-2xl font-semibold">{team.name}</h1>
        {locked && <StatusPill tone="success">Locked</StatusPill>}
      </div>
      <p className="text-sm text-muted mb-6">{team.oneLiner}</p>

      <div className="flex gap-1 bg-app border border-border rounded-md p-1 w-fit mb-5">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3.5 py-1.5 rounded text-sm font-display transition-colors ${
              tab === t ? 'bg-white text-ink shadow-card' : 'text-muted hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        {tab === 'Rubric' && (
          <>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="font-display text-sm font-semibold text-muted uppercase tracking-wide">Judging rubric</h2>
              <span className="font-display text-sm tabular-nums text-primary font-semibold">{total} / {RUBRIC_TOTAL}</span>
            </div>
            <div className="divide-y divide-border">
              {RUBRIC.map((c, i) => (
                <ScoreRow
                  key={c.id}
                  index={i + 1}
                  criterion={c}
                  value={scores[c.id]}
                  onChange={(v) => handleScoreChange(c.id, v)}
                  disabled={locked}
                />
              ))}
            </div>

            {error && <p className="text-sm text-danger mt-4">{error}</p>}

            {!locked && !confirming && (
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={handleSaveProgress}
                  className="px-4 py-2 rounded-md font-display text-sm font-medium text-ink border border-border hover:bg-app transition-colors"
                >
                  Save Progress
                </button>
                <button
                  type="button"
                  onClick={handleRequestSubmit}
                  className="px-4 py-2 rounded-md font-display text-sm font-semibold text-white bg-primary hover:bg-primarydark transition-colors"
                >
                  Submit & Lock
                </button>
                {savedAt && (
                  <span className="text-xs text-muted">
                    Saved at {new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            )}

            {confirming && (
              <div className="mt-6 border border-primary/30 bg-primarylight rounded-md p-5">
                <p className="text-sm text-ink mb-4">
                  You're about to lock in a total of <span className="tabular-nums font-display font-semibold">{total}/{RUBRIC_TOTAL}</span> for{' '}
                  {team.name}. This can't be changed afterward without an organiser unlocking it.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleConfirmSubmit}
                    className="px-4 py-2 rounded-md font-display text-sm font-semibold text-white bg-primary hover:bg-primarydark transition-colors"
                  >
                    Confirm submit
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="px-4 py-2 rounded-md font-display text-sm font-medium text-ink border border-border hover:bg-app transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {locked && (
              <p className="text-sm text-muted mt-6 pt-6 border-t border-border">
                Scores locked — contact an organiser to make changes.
              </p>
            )}

            <p className="text-xs text-muted mt-4">
              Only you can see this evaluation — other judges can't view your scores or comments.
            </p>
          </>
        )}

        {tab === 'Project Preview' && (
          <div>
            <h2 className="font-display text-sm font-semibold text-muted uppercase tracking-wide mb-4">Submitted files</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between border-b border-border pb-2"><span>Presentation</span><span className="text-muted">{team.files.presentation}</span></li>
              <li className="flex justify-between border-b border-border pb-2"><span>Demo video</span><span className="text-muted">{team.files.video}</span></li>
              <li className="flex justify-between border-b border-border pb-2"><span>Documents</span><span className="text-muted">{team.files.documents}</span></li>
              <li className="flex justify-between"><span>Images</span><span className="text-muted">{team.files.images}</span></li>
            </ul>
            <p className="text-xs text-muted mt-4">
              Inline preview isn't wired up in this demo — connect file storage to view submissions here.
            </p>
          </div>
        )}

        {tab === 'Comments' && (
          <div>
            <h2 className="font-display text-sm font-semibold text-muted uppercase tracking-wide mb-3">Notes for organisers</h2>
            <textarea
              rows={6}
              disabled={locked}
              placeholder="Not shared with the team — visible to organisers only if needed."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted/60 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow resize-none disabled:opacity-50 disabled:bg-app"
            />
          </div>
        )}
      </div>
    </div>
  );
}
