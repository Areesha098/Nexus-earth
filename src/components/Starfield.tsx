import { useMemo } from "react";
import spaceBg from "@/assets/space-bg.jpg";

function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function Starfield({ dense = 80 }: { dense?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: dense }).map((_, i) => {
        const r1 = pseudoRandom(i * 4 + 1);
        const r2 = pseudoRandom(i * 4 + 2);
        const r3 = pseudoRandom(i * 4 + 3);
        const r4 = pseudoRandom(i * 4 + 4);
        return {
          id: i,
          top: +(r1 * 100).toFixed(4),
          left: +(r2 * 100).toFixed(4),
          size: +(r3 * 2 + 0.5).toFixed(4),
          delay: +(r4 * 4).toFixed(4),
        };
      }),
    [dense],
  );
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{ backgroundImage: `url(${spaceBg})` }}
      />
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 bg-background/50" />
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      <div className="absolute inset-0 scanlines opacity-30" />
    </div>
  );
}
