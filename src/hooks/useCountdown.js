import { useEffect, useMemo, useState } from 'react';

export function useCountdown(hoursFromNow) {
  const target = useMemo(() => Date.now() + hoursFromNow * 3600 * 1000, [hoursFromNow]);
  const [remaining, setRemaining] = useState(target - Date.now());

  useEffect(() => {
    const id = setInterval(() => setRemaining(Math.max(0, target - Date.now())), 1000);
    return () => clearInterval(id);
  }, [target]);

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, '0');

  return { hours: pad(hours), minutes: pad(minutes), seconds: pad(seconds) };
}
