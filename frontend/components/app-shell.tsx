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
    <div className="min-h-screen bg-surface/20">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border/65 bg-surface/88 px-4 py-4 backdrop-blur-xl lg:block">
        <Link href="/" className="focus-ring flex h-10 items-center gap-3 rounded-md px-2 transition hover:bg-elevated/35">
          <span className="flex size-7 items-center justify-center rounded-md border border-border/80 bg-elevated/80 text-sm font-semibold text-ink shadow-[0_1px_0_rgb(255_255_255/0.04)_inset]">
            b
          </span>
          <span className="text-sm font-semibold text-ink">bob</span>
        </Link>

        <nav className="mt-8 space-y-1.5">
          {navItems.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "focus-ring flex h-9 items-center rounded-md border border-transparent px-2 text-sm transition duration-200",
                  active
                    ? "border-border/60 bg-elevated/70 text-ink shadow-[0_1px_0_rgb(255_255_255/0.035)_inset]"
                    : "text-muted hover:bg-elevated/45 hover:text-ink",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-4 bottom-4 rounded-lg border border-border/55 bg-panel/72 p-3 shadow-[0_1px_0_rgb(255_255_255/0.03)_inset]">
          <p className="text-xs font-medium text-faint">Workspace</p>
          <p className="mt-1 truncate text-sm font-medium text-ink">Founder pipeline</p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-border/60 bg-surface/[0.78] backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="focus-ring flex items-center gap-2 rounded-md lg:hidden">
              <span className="flex size-7 items-center justify-center rounded-md border border-border/80 bg-elevated/80 text-sm font-semibold">
                b
              </span>
              <span className="text-sm font-semibold">bob</span>
            </Link>
            <div className="hidden text-xs font-medium uppercase tracking-[0.16em] text-faint lg:block">
              Leads workspace
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden h-8 w-56 items-center rounded-md border border-border/60 bg-panel/72 px-3 text-sm text-faint shadow-[0_1px_0_rgb(255_255_255/0.025)_inset] sm:flex">
                Search leads
              </div>
              <div className="size-7 rounded-full border border-border/70 bg-elevated/75 shadow-[0_1px_0_rgb(255_255_255/0.04)_inset]" />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
