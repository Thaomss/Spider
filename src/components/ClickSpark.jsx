import { useRef } from 'react';

export default function ClickSpark({ children }) {
  const ref = useRef(null);
  const click = e => {
    const host = ref.current;
    if (!host) return;
    const r = host.getBoundingClientRect();
    for (let i = 0; i < 8; i++) {
      const s = document.createElement('i');
      s.className = 'spark';
      s.style.left = `${e.clientX - r.left}px`;
      s.style.top = `${e.clientY - r.top}px`;
      s.style.setProperty('--a', `${i * 45}deg`);
      host.appendChild(s);
      setTimeout(() => s.remove(), 520);
    }
  };
  return <div className="click-spark-host" ref={ref} onClick={click}>{children}</div>;
}
