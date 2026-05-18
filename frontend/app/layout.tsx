import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { getAuthToken } from "@/lib/server-auth";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialSignedIn = Boolean(await getAuthToken());

  return (
    <html lang="en">
      <body className="antialiased">
        <AppShell initialSignedIn={initialSignedIn}>{children}</AppShell>
      </body>
    </html>
  );
}
