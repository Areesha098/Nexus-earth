import type { ReactNode } from "react";

export function HoloPanel({
  children,
  className = "",
  label,
  tone = "neon",
}: {
  children: ReactNode;
  className?: string;
  label?: string;
  tone?: "neon" | "danger" | "accent";
}) {
  const borderVar =
    tone === "danger" ? "var(--danger)" : tone === "accent" ? "var(--neon-2)" : "var(--neon)";
  return (
    <div
      className={`holo-panel relative rounded-lg p-4 ${className}`}
      style={{ ["--holo" as string]: borderVar } as React.CSSProperties}
    >
      {label && (
        <div className="absolute -top-2 left-4 px-2 bg-background font-display text-[10px] tracking-[0.4em] text-muted-foreground">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}
