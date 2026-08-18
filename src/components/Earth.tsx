import { motion } from "framer-motion";
import earthImg from "@/assets/earth.jpg";

interface EarthProps {
  size?: number;
  interactive?: boolean;
}

export function Earth({ size = 420, interactive = true }: EarthProps) {
  return (
    <div
      className="relative flex items-center justify-center animate-float-slow"
      style={{ width: size, height: size }}
    >
      {/* atmosphere glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, oklch(0.75 0.2 210 / 0.35), transparent 70%)",
          filter: "blur(20px)",
          transform: "scale(1.4)",
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: -size * 0.06,
          background:
            "radial-gradient(circle, transparent 55%, oklch(0.7 0.2 210 / 0.35) 62%, transparent 70%)",
        }}
      />

      {/* Earth core with rotating texture */}
      <motion.div
        className="relative rounded-full overflow-hidden"
        style={{
          width: size,
          height: size,
          boxShadow: "inset -30px -20px 80px oklch(0 0 0 / 0.7), 0 0 60px oklch(0.7 0.2 210 / 0.5)",
        }}
        whileHover={interactive ? { scale: 1.04 } : undefined}
      >
        <motion.div
          className="absolute -inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${earthImg})`,
            width: size * 2,
            height: size,
            backgroundSize: `${size * 2}px ${size}px`,
          }}
          animate={{ x: [0, -size] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, oklch(1 0 0 / 0.15), transparent 55%), radial-gradient(circle at 70% 70%, oklch(0 0 0 / 0.55), transparent 60%)",
          }}
        />
      </motion.div>

      {/* Orbit ring */}
      <div
        className="absolute rounded-full border animate-spin-slow"
        style={{
          inset: -size * 0.12,
          borderColor: "color-mix(in oklab, var(--neon) 40%, transparent)",
          borderStyle: "dashed",
        }}
      />
      <div
        className="absolute rounded-full border animate-spin-slow"
        style={{
          inset: -size * 0.22,
          borderColor: "color-mix(in oklab, var(--neon-2) 30%, transparent)",
          animationDirection: "reverse",
          animationDuration: "140s",
        }}
      />
    </div>
  );
}
