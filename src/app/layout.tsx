import type { Metadata } from "next";
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SITE } from "@/lib/site";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// generateMetadata (not a static `metadata` object) so APP_URL and
// ALLOW_INDEXING are read at request time from the environment's vars.
export function generateMetadata(): Metadata {
  const base = process.env.APP_URL || "http://localhost:3000";
  const indexable = process.env.ALLOW_INDEXING !== "false";

  return {
    metadataBase: new URL(base),
    ...(indexable ? {} : { robots: { index: false, follow: false } }),
    title: {
      default: `${SITE.name} — ${SITE.tagline}`,
      template: `%s | ${SITE.name}`,
    },
    description: SITE.description,
    keywords: [
      "semiconductor equipment sourcing",
      "used semiconductor equipment",
      "data center hardware",
      "refurbished servers",
      "industrial machinery",
      "used equipment dealer",
    ],
    openGraph: {
      title: `${SITE.name} — ${SITE.tagline}`,
      description: SITE.description,
      siteName: SITE.name,
      type: "website",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
