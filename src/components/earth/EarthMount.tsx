import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const Earth3D = lazy(() => import("./Earth3D"));

interface Props {
  health?: number;
  pulseKey?: number;
  interactive?: boolean;
  zoom?: number;
  autoRotate?: boolean;
  className?: string;
  fallback?: React.ReactNode;
}

export function EarthMount({ className, fallback, ...rest }: Props) {
  return (
    <div className={className ?? "absolute inset-0"}>
      <ClientOnly fallback={fallback ?? <EarthFallback />}>
        <Suspense fallback={fallback ?? <EarthFallback />}>
          <Earth3D {...rest} />
        </Suspense>
      </ClientOnly>
    </div>
  );
}

function EarthFallback() {
  return (
    <div className="w-full h-full grid place-items-center">
      <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-3xl animate-pulse" />
    </div>
  );
}
