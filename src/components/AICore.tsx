import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const AICoreScene = lazy(() => import("./AICoreScene"));

export function AICore({ size = 220 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }} className="relative">
      <ClientOnly
        fallback={
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl animate-pulse" />
        }
      >
        <Suspense fallback={null}>
          <AICoreScene />
        </Suspense>
      </ClientOnly>
    </div>
  );
}
