import type { Metadata } from "next";
import Link from "next/link";
import { TrackForm } from "@/components/site/track-form";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Track your request",
  description:
    "Check the status of your Zuronix equipment request or listing submission with your reference number and email.",
  alternates: { canonical: "/track" },
};

export default function TrackPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground/80">
            Track a request
          </li>
        </ol>
      </nav>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Track your request</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
        Enter the reference number from your confirmation and the email you used. You&apos;ll see
        where your request stands — no account needed.
      </p>

      <TrackForm />

      <p className="mt-8 text-sm text-muted-foreground">
        Lost your reference number? Email{" "}
        <a href={`mailto:${SITE.email}`} className="link-quiet font-medium">
          {SITE.email}
        </a>{" "}
        from the address you used and we&apos;ll find it.
      </p>
    </div>
  );
}
