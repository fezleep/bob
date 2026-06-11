"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { CommandPalette } from "@/components/command-palette";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/demo", label: "Demo" },
  { href: "/workspace", label: "Workspace" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/leads", label: "Leads" },
  { href: "/about", label: "About" },
];

function LogoutButton({
  className,
  formClassName,
}: {
  className: string;
  formClassName?: string;
}) {
  return (
    <form action="/logout" method="post" className={formClassName}>
      <button type="submit" className={className}>
        Logout
      </button>
    </form>
  );
}

export function AppShell({
  children,
  initialSignedIn = false,
}: {
  children: ReactNode;
  initialSignedIn?: boolean;
}) {
  const pathname = usePathname();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(initialSignedIn);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const activeSection =
    navItems.find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
    )?.label ?? "bob";
  const openCommandPalette = useCallback(() => setCommandPaletteOpen(true), []);
  const closeCommandPalette = useCallback(() => setCommandPaletteOpen(false), []);

  useEffect(() => {
    setSignedIn(initialSignedIn);
  }, [initialSignedIn]);

  useEffect(() => {
    const controller = new AbortController();

    async function refreshAuthState() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
          signal: controller.signal,
        });

        setSignedIn(response.ok);
        setSessionMessage(
          response.status === 503
            ? "Unable to validate session because the backend is not reachable."
            : null
        );
      } catch {
        if (!controller.signal.aborted) {
          setSignedIn(false);
          setSessionMessage("Unable to validate session because the backend is not reachable.");
        }
      }
    }

    void refreshAuthState();

    return () => controller.abort();
  }, [pathname]);

  useEffect(() => {
    function openFromKeyboard(event: KeyboardEvent) {
      const key = String(event.key ?? "").toLowerCase();
      const primaryShortcut = key === "k" && (event.metaKey || event.ctrlKey);
      const fallbackShortcut = key === "k" && event.ctrlKey && event.shiftKey;

      if (primaryShortcut || fallbackShortcut) {
        event.preventDefault();
        openCommandPalette();
      }
    }

    window.addEventListener("keydown", openFromKeyboard);

    return () => window.removeEventListener("keydown", openFromKeyboard);
  }, [openCommandPalette]);

  return (
    <div className="min-h-screen bg-surface/20">
      <CommandPalette open={commandPaletteOpen} onClose={closeCommandPalette} />
      <aside className="fixed inset-y-0 left-0 hidden w-64 overflow-hidden border-r border-border/60 bg-surface/90 px-4 py-4 shadow-[24px_0_80px_rgb(0_0_0/0.2)] backdrop-blur-2xl lg:block">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_24px_18px,rgb(var(--accent)/0.15),transparent_15rem)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        <Link href="/" className="focus-ring relative flex h-10 items-center gap-3 rounded-md px-2 transition hover:bg-elevated/35">
          <span className="flex size-8 items-center justify-center overflow-hidden rounded-md border border-accent/25 bg-elevated/80 shadow-[0_1px_0_rgb(255_255_255/0.05)_inset]">
            <Image
              src="/branding/bob-logo.png"
              alt=""
              width={32}
              height={32}
              className="size-8 object-contain"
              priority
            />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink">bob</span>
            <span className="block text-[0.68rem] leading-3 text-faint">calm ops</span>
          </span>
        </Link>

        <nav className="relative mt-8 space-y-1.5">
          {navItems.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "focus-ring flex h-9 items-center justify-between rounded-md border border-transparent px-2 text-sm transition duration-200",
                  active
                    ? "border-accent/28 bg-elevated/75 text-ink shadow-[0_1px_0_rgb(255_255_255/0.05)_inset,0_12px_36px_rgb(0_0_0/0.18)]"
                    : "text-muted hover:bg-elevated/45 hover:text-ink",
                ].join(" ")}
              >
                <span>{item.label}</span>
                {active ? (
                  <span className="size-1.5 rounded-full bg-accent/85 shadow-[0_0_16px_rgb(var(--accent)/0.45)]" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="relative mt-5 border-t border-border/45 pt-4">
          {signedIn ? (
            <LogoutButton className="focus-ring flex h-9 w-full items-center rounded-md px-2 text-left text-sm text-muted transition hover:bg-elevated/45 hover:text-ink" />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                className="focus-ring flex h-9 items-center justify-center rounded-md border border-border/65 text-sm text-muted transition hover:border-accent/34 hover:text-ink"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="focus-ring flex h-9 items-center justify-center rounded-md border border-accent/24 bg-accent/[0.08] text-sm text-[rgb(var(--champagne))] transition hover:border-accent/38 hover:text-ink"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        <div className="absolute inset-x-4 bottom-4 rounded-lg border border-accent/16 bg-panel/76 p-3 shadow-[0_1px_0_rgb(255_255_255/0.04)_inset,0_20px_50px_rgb(0_0_0/0.24)] backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-accent/80 shadow-[0_0_18px_rgb(var(--accent)/0.38)]" />
            <p className="text-xs font-medium text-faint">bob is watching the rhythm</p>
          </div>
          <p className="mt-2 text-sm leading-5 text-muted">Things feel quiet right now.</p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-border/60 bg-surface/[0.78] backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="focus-ring flex items-center gap-2 rounded-md lg:hidden">
              <span className="flex size-7 items-center justify-center overflow-hidden rounded-md border border-border/80 bg-elevated/80">
                <Image
                  src="/branding/bob-logo.png"
                  alt=""
                  width={28}
                  height={28}
                  className="size-7 object-contain"
                  priority
                />
              </span>
              <span className="text-sm font-semibold">bob</span>
            </Link>
            <div className="hidden text-xs font-medium uppercase tracking-[0.16em] text-faint lg:block">
              {activeSection}
            </div>
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={openCommandPalette}
                className="focus-ring hidden h-8 w-64 items-center justify-between gap-3 rounded-md border border-border/65 bg-panel/88 px-2.5 text-sm text-muted shadow-[0_1px_0_rgb(255_255_255/0.035)_inset] transition duration-200 hover:border-accent/34 hover:bg-elevated/64 hover:text-ink md:w-72 sm:flex"
                aria-label="Open command palette"
              >
                <span className="shrink-0">Search Bob</span>
                <span className="flex min-w-0 shrink-0 items-center gap-1 text-[0.62rem] font-medium uppercase leading-none tracking-[0.08em] text-faint">
                  <kbd className="flex h-5 items-center rounded border border-border/70 bg-black/28 px-1.5">Ctrl/Cmd</kbd>
                  <kbd className="flex h-5 min-w-5 items-center justify-center rounded border border-border/70 bg-black/28 px-1">K</kbd>
                  <kbd className="hidden h-5 items-center rounded border border-border/70 bg-black/28 px-1.5 lg:flex">
                    Ctrl+Shift+K
                  </kbd>
                </span>
              </button>
              <button
                type="button"
                onClick={openCommandPalette}
                className="focus-ring flex size-8 items-center justify-center rounded-md border border-border/65 bg-panel/88 text-sm font-semibold text-muted shadow-[0_1px_0_rgb(255_255_255/0.035)_inset] transition duration-200 hover:border-accent/34 hover:bg-elevated/64 hover:text-ink sm:hidden"
                aria-label="Open command palette"
              >
                <kbd className="flex size-5 items-center justify-center rounded border border-border/70 bg-black/28 text-[0.68rem] leading-none">
                  K
                </kbd>
              </button>
              <div className="hidden size-7 rounded-full border border-accent/25 bg-elevated/75 shadow-[0_1px_0_rgb(255_255_255/0.04)_inset] sm:block" />
              {signedIn ? (
                <LogoutButton
                  formClassName="hidden sm:block"
                  className="focus-ring flex h-8 items-center rounded-md border border-border/65 px-3 text-xs font-medium text-faint transition hover:border-accent/34 hover:text-ink"
                />
              ) : null}
            </div>
          </div>
          <nav
            className="flex flex-wrap items-center gap-1.5 border-t border-border/45 px-4 py-2 sm:px-6 lg:hidden"
            aria-label="Mobile navigation"
          >
            {navItems.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "focus-ring rounded-md border px-2.5 py-1.5 text-xs font-medium transition duration-200",
                    active
                      ? "border-accent/28 bg-elevated/75 text-ink"
                      : "border-transparent text-muted hover:bg-elevated/45 hover:text-ink",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
            <span className="mx-0.5 h-5 w-px bg-border/55" aria-hidden="true" />
            {signedIn ? (
              <LogoutButton className="focus-ring rounded-md border border-border/65 bg-elevated/25 px-2.5 py-1.5 text-xs font-medium text-muted transition duration-200 hover:border-accent/34 hover:text-ink" />
            ) : (
              <>
                <Link
                  href="/login"
                  className="focus-ring rounded-md border border-border/65 bg-elevated/25 px-2.5 py-1.5 text-xs font-medium text-muted transition duration-200 hover:border-accent/34 hover:text-ink"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="focus-ring rounded-md border border-accent/28 bg-accent/[0.08] px-2.5 py-1.5 text-xs font-medium text-[rgb(var(--champagne))] transition duration-200 hover:border-accent/42 hover:text-ink"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {sessionMessage ? (
            <div
              role="status"
              className="mb-5 rounded-md border border-border/70 bg-elevated/55 px-3 py-2 text-sm text-muted"
            >
              {sessionMessage}
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
