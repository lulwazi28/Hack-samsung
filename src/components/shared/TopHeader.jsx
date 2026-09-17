import { Bell } from 'lucide-react';

export default function TopHeader({ initials = '?', unread = 0, children }) {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-border bg-card shrink-0">
      <div>{children}</div>
      <div className="flex items-center gap-4">
        <button
        type="button"
        className="relative h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted hover:text-ink hover:border-ink/30 transition-colors"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-danger text-white text-[10px] leading-4 text-center font-display">
            {unread}
          </span>
        )}
      </button>
      <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center text-xs font-display font-semibold">
        {initials}
      </div>
      </div>
    </header>
  );
}
