import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Signal lost</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This transmission never reached Nexus Earth command.
        </p>

        <div className="mt-6">
          <Link to="/" className="btn-neon inline-flex">
            Return to base
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-xl w-full text-center holo-panel rounded-xl p-6 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-danger/15 border border-danger/40 text-danger text-[10px] font-display tracking-widest">
          SUBSYSTEM TELEMETRY INTERRUPT
        </div>
        <h1 className="text-xl font-display font-bold tracking-tight text-foreground">
          Autonomous Recovery Protocol
        </h1>
        <p className="text-xs text-muted-foreground">
          The planetary simulation core encountered a telemetry interrupt and held state safely.
        </p>

        {/* Developer / Debug Info */}
        <div className="text-left bg-black/70 rounded-lg p-3 border border-danger/30 font-mono text-[11px] space-y-1.5 overflow-x-auto max-h-40">
          <div className="text-danger font-semibold">
            {error?.name || "Error"}: {error?.message || "Unknown subsystem exception"}
          </div>
          {error?.stack && (
            <pre className="text-[10px] text-muted-foreground/80 whitespace-pre-wrap leading-tight">
              {error.stack.split("\n").slice(0, 4).join("\n")}
            </pre>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2.5 pt-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-neon text-xs inline-flex items-center gap-2"
          >
            Re-sync Subsystem
          </button>
          <Link
            to="/command"
            className="rounded-lg border border-border/70 px-4 py-2 text-xs font-display tracking-wider hover:bg-accent/20 transition-all text-foreground"
          >
            Return to Command Deck
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Nexus Earth — The AI Operating System for Humanity" },
      {
        name: "description",
        content:
          "Nexus Earth: predict, simulate and transform. A multi-agent AI platform that models Earth's future from 2026 to 2050",
      },
      { name: "author", content: "Nexus Earth" },
      { property: "og:title", content: "Nexus Earth — The AI Operating System for Humanity" },
      {
        property: "og:description",
        content:
          "Nexus Earth: predict, simulate and transform. A multi-agent AI platform that models Earth's future from 2026 to 2050",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Nexus Earth — The AI Operating System for Humanity" },
      {
        name: "twitter:description",
        content:
          "Nexus Earth: predict, simulate and transform. A multi-agent AI platform that models Earth's future from 2026 to 2050",
      },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/9d5dc787-a543-4388-be70-667b5fc1bc99",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/9d5dc787-a543-4388-be70-667b5fc1bc99",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Rajdhani:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
