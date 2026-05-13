"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/leads", label: "Leads" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border/70 bg-surface/80 px-4 py-4 backdrop-blur-xl lg:block">
        <Link href="/" className="flex h-10 items-center gap-3 px-2">
          <span className="flex size-7 items-center justify-center rounded-md border border-border bg-elevated text-sm font-semibold text-ink">
            b
          </span>
          <span className="text-sm font-medium text-ink">bob</span>
        </Link>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex h-9 items-center rounded-md px-2 text-sm transition",
                  active
                    ? "bg-elevated text-ink"
                    : "text-muted hover:bg-elevated/60 hover:text-ink",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-4 bottom-4 rounded-lg border border-border/60 bg-panel/70 p-3">
          <p className="text-xs text-faint">Workspace</p>
          <p className="mt-1 text-sm font-medium text-ink">Founder pipeline</p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-border/70 bg-surface/[0.76] backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <span className="flex size-7 items-center justify-center rounded-md border border-border bg-elevated text-sm font-semibold">
                b
              </span>
              <span className="text-sm font-medium">bob</span>
            </Link>
            <div className="hidden text-sm text-muted lg:block">Leads workspace</div>
            <div className="flex items-center gap-3">
              <div className="hidden h-8 w-56 items-center rounded-md border border-border/70 bg-panel px-3 text-sm text-faint sm:flex">
                Search leads
              </div>
              <div className="size-7 rounded-full border border-border bg-elevated" />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
