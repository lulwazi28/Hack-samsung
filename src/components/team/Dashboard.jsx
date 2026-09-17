import { Link, useOutletContext } from 'react-router-dom';
import { FolderKanban, Megaphone, Trophy, ArrowRight } from 'lucide-react';
import { useCountdown } from '../../hooks/useCountdown.js';
import CountdownBoxes from '../shared/CountdownBoxes.jsx';
import StatusPill from '../shared/StatusPill.jsx';

const ANNOUNCEMENTS = [
  { time: '11 min ago', text: 'Round 2 judging begins at 14:00 — make sure your submission is in by 13:45.', isNew: true },
  { time: '48 min ago', text: 'Wifi reset for the main hall: network "HackJudge-Guest", password HACK2026.', isNew: false },
  { time: '2 hr ago', text: 'Demo videos must be under 3 minutes to be reviewed by judges.', isNew: false },
];

const QUICK_LINKS = [
  { to: '/team/submission', label: 'Submit project', icon: FolderKanban },
  { to: '/team/announcements', label: 'View announcements', icon: Megaphone },
  { to: '/team/leaderboard', label: 'Check leaderboard', icon: Trophy },
];

export default function Dashboard() {
  const { team } = useOutletContext();
  const { hours, minutes, seconds } = useCountdown(3.7);
  const submitted = false; // wire this up to real submission state / API

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-2xl font-semibold mb-1">Hello, {team.name} 👋</h1>
      <p className="text-sm text-muted mb-8">Here's what's happening in the competition.</p>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5 mb-6">
        {/* Time remaining */}
        <div className="bg-sidebar text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-display font-semibold">Round 2 — Live Judging</p>
              <p className="text-xs text-sidebarmuted mt-0.5">Time remaining</p>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-2.5 py-1 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-successlight animate-pulse" />
              Ongoing
            </span>
          </div>
          <CountdownBoxes hours={hours} minutes={minutes} seconds={seconds} />
        </div>

        {/* Quick links */}
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="font-display font-semibold text-sm text-muted uppercase tracking-wide mb-4">Quick links</p>
          <div className="space-y-2">
            {QUICK_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="flex items-center justify-between px-3 py-2.5 rounded-md border border-border hover:border-primary/40 hover:bg-primarylight/50 transition-colors group"
              >
                <span className="flex items-center gap-2.5 text-sm font-display">
                  <l.icon className="h-4 w-4 text-primary" />
                  {l.label}
                </span>
                <ArrowRight className="h-4 w-4 text-muted group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Submission status */}
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="font-display font-semibold text-sm text-muted uppercase tracking-wide mb-3">Your submission</p>
          <div className="flex items-center justify-between">
            <StatusPill tone={submitted ? 'success' : 'danger'}>
              {submitted ? 'Submitted' : 'Not Submitted'}
            </StatusPill>
            <span className="text-xs text-muted">Deadline 20 Apr 2026</span>
          </div>
          <Link
            to="/team/submission"
            className="inline-flex items-center gap-1.5 text-sm font-display text-primary hover:underline mt-4"
          >
            {submitted ? 'Edit submission' : 'Go to submission'}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Announcements preview */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-display font-semibold text-sm text-muted uppercase tracking-wide">Recent announcements</p>
            <Link to="/team/announcements" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <ul className="space-y-3">
            {ANNOUNCEMENTS.slice(0, 2).map((a, i) => (
              <li key={i} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-ink">{a.text}</p>
                  <p className="text-xs text-muted mt-0.5">{a.time}</p>
                </div>
                {a.isNew && <StatusPill tone="primary">New</StatusPill>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
