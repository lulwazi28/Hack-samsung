export default function BarRow({ label, value, max, color = '#2563EB' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-sm text-ink">{label}</span>
      <div className="flex-1 h-2.5 bg-app rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="w-10 shrink-0 text-sm text-muted tabular-nums text-right">{value}</span>
    </div>
  );
}
