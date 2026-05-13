import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "bob",
  description: "quiet software for modern teams.",
  icons: {
    icon: "/branding/bob-logo.png",
    shortcut: "/branding/bob-logo.png",
    apple: "/branding/bob-logo.png",
  },
  openGraph: {
    title: "bob",
    description: "quiet software for modern teams.",
    images: ["/branding/bob-mascot.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
