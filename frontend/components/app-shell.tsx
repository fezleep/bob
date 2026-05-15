"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/leads", label: "Leads" },
  { href: "/pipeline", label: "Pipeline" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface/20">
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
                  "focus-ring flex h-9 items-center rounded-md border border-transparent px-2 text-sm transition duration-200",
                  active
                    ? "border-border/65 bg-elevated/75 text-ink shadow-[0_1px_0_rgb(255_255_255/0.045)_inset,0_12px_36px_rgb(0_0_0/0.18)]"
                    : "text-muted hover:bg-elevated/45 hover:text-ink",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

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
              Leads workspace
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden h-8 w-56 items-center rounded-md border border-border/50 bg-panel/72 px-3 text-sm text-faint shadow-[0_1px_0_rgb(255_255_255/0.025)_inset] sm:flex">
                Search conversations
              </div>
              <div className="size-7 rounded-full border border-accent/25 bg-elevated/75 shadow-[0_1px_0_rgb(255_255_255/0.04)_inset]" />
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
