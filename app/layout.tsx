import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PageTransitionProvider } from "./page-transition";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Brandon Chen — Electronics & Controls",
  description:
    "Professional portfolio of Brandon Chen: electronics and controls, embedded hardware, sensor integration, and product development.",
  icons: {
    icon: `${basePath}/favicon.png`,
    shortcut: `${basePath}/favicon.png`,
  },
  openGraph: {
    title: "Brandon Chen — Electronics & Controls",
    description:
      "Electronics, embedded hardware, sensor integration, and product development by Brandon Chen.",
    type: "website",
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: "Brandon Chen — Electronics & Controls",
    description: "Embedded hardware, sensor integration, and product development.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <PageTransitionProvider>{children}</PageTransitionProvider>
        <div className="orientation-guard" role="status">
          <span>Portrait view only</span>
          <strong>Rotate your phone upright.</strong>
        </div>
      </body>
    </html>
  );
}
