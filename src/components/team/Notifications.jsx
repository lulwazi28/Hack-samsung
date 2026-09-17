import { FileText, Clock, Trophy } from 'lucide-react';

const NOTIFICATIONS = [
  { icon: Clock, text: 'Submission deadline reminder — 2 hours left for Round 2.', time: '10 min ago', unread: true },
  { icon: FileText, text: 'Your project was successfully saved as a draft.', time: '1 hr ago', unread: true },
  { icon: Trophy, text: 'Leaderboard updated — you moved up to rank 8.', time: '3 hr ago', unread: false },
  { icon: FileText, text: 'Judging criteria confirmed for Round 2.', time: 'Yesterday', unread: false },
];

export default function Notifications() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold mb-1">Notifications</h1>
      <p className="text-sm text-muted mb-6">Deadlines, submissions, and updates that involve you.</p>

      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {NOTIFICATIONS.map((n, i) => (
          <div key={i} className="flex items-start gap-3 px-6 py-4">
            <span className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${n.unread ? 'bg-primarylight text-primary' : 'bg-app text-muted'}`}>
              <n.icon className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className={`text-sm ${n.unread ? 'text-ink font-medium' : 'text-muted'}`}>{n.text}</p>
              <p className="text-xs text-muted mt-0.5">{n.time}</p>
            </div>
            {n.unread && <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}
