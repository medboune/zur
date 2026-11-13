import type { Metadata } from "next";
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import { absoluteUrl, isIndexable } from "@/lib/seo";

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
  const indexable = isIndexable();
  const siteUrl = absoluteUrl("/");

  return {
    metadataBase: new URL(siteUrl),
    ...(indexable ? {} : { robots: { index: false, follow: false } }),
    title: {
      default: `${SITE.name} — ${SITE.tagline}`,
      template: `%s | ${SITE.name}`,
    },
    description: SITE.description,
    applicationName: SITE.name,
    keywords: [
      "semiconductor equipment sourcing",
      "used semiconductor equipment",
      "data center hardware",
      "refurbished servers",
      "industrial machinery",
      "used equipment dealer",
    ],
    alternates: { canonical: "/" },
    openGraph: {
      title: `${SITE.name} — ${SITE.tagline}`,
      description: SITE.description,
      siteName: SITE.name,
      type: "website",
      url: siteUrl,
      locale: "en_US",
      images: [
        {
          url: "/images/hero-bg.jpg",
          width: 1600,
          height: 900,
          alt: "Industrial equipment sourcing and sales — Zuronix",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE.name} — ${SITE.tagline}`,
      description: SITE.description,
      images: ["/images/hero-bg.jpg"],
    },
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "48x48" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/site.webmanifest",
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
      </body>
    </html>
  );
}
