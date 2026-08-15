import { useEffect, useMemo, useState } from 'react';

const chars = '▓▒░<>/\\[]{}01#@!?';

export default function DecryptedText({ text, speed = 28, start = false, className = '' }) {
  const [tick, setTick] = useState(0);
  const [done, setDone] = useState(false);
  const letters = useMemo(() => [...text], [text]);

  useEffect(() => {
    if (!start) return;
    setTick(0);
    setDone(false);
    const total = letters.length + 8;
    const timer = setInterval(() => {
      setTick(v => {
        if (v >= total) {
          clearInterval(timer);
          setDone(true);
          return v;
        }
        return v + 1;
      });
    }, speed);
    return () => clearInterval(timer);
  }, [start, letters.length, speed]);

  const shown = letters.map((c, i) => {
    if (c === ' ') return ' ';
    if (done || i < tick - 5) return c;
    if (i < tick + 5) return chars[(i * 7 + tick * 3) % chars.length];
    return '·';
  }).join('');

  return <span className={className} aria-label={text}>{shown}</span>;
}
