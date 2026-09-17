function Box({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/10 rounded-md px-4 py-2.5 min-w-[3.25rem] text-center">
        <span className="font-display text-2xl font-semibold tabular-nums">{value}</span>
      </div>
      <span className="text-xs text-white/60 mt-1.5">{label}</span>
    </div>
  );
}

export default function CountdownBoxes({ hours, minutes, seconds }) {
  return (
    <div className="flex items-center gap-2">
      <Box value={hours} label="Hours" />
      <span className="font-display text-xl text-white/40 pb-5">:</span>
      <Box value={minutes} label="Minutes" />
      <span className="font-display text-xl text-white/40 pb-5">:</span>
      <Box value={seconds} label="Seconds" />
    </div>
  );
}
