import StatusPill from '../shared/StatusPill.jsx';

const ANNOUNCEMENTS = [
  { time: '11 min ago', text: 'Round 2 judging begins at 14:00 — make sure your submission is in by 13:45.', isNew: true },
  { time: '48 min ago', text: 'Wifi reset for the main hall: network "HackJudge-Guest", password HACK2026.', isNew: false },
  { time: '2 hr ago', text: 'Demo videos must be under 3 minutes to be reviewed by judges.', isNew: false },
  { time: 'Yesterday', text: 'Check-in for Round 1 closes at 09:00 sharp — badges required at the door.', isNew: false },
  { time: '2 days ago', text: 'Welcome to Autumn Build 2026! Opening ceremony starts in the main hall.', isNew: false },
];

export default function Announcements() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold mb-1">Announcements</h1>
      <p className="text-sm text-muted mb-6">Updates from the organisers, newest first.</p>

      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {ANNOUNCEMENTS.map((a, i) => (
          <div key={i} className="flex items-start justify-between gap-4 px-6 py-4">
            <div>
              <p className="text-sm text-ink">{a.text}</p>
              <p className="text-xs text-muted mt-1">{a.time}</p>
            </div>
            {a.isNew && <StatusPill tone="primary">New</StatusPill>}
          </div>
        ))}
      </div>
    </div>
  );
}
