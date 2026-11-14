"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, Mail, Phone, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";
import type { SubmissionResult } from "@/components/site/form/use-lead-submission";

export function Confirmation({
  result,
  kind,
}: {
  result: SubmissionResult;
  kind: "sourcing" | "surplus";
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — the reference is visible to copy manually.
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-xl border border-primary/30 bg-primary/5 p-6 sm:p-8"
    >
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
        <span aria-hidden="true" className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3.5" />
        </span>
        {result.duplicate ? "Already received" : "Received"}
      </p>

      <h2 className="mt-4 text-2xl font-semibold tracking-tight">
        Your reference number
      </h2>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <code className="text-part rounded-lg border border-primary/30 bg-card px-4 py-2.5 text-xl font-semibold text-primary shadow-sm">
          {result.reference}
        </code>
        <Button type="button" variant="outline" size="sm" onClick={copy}>
          {copied ? (
            <>
              <Check className="size-3.5" aria-hidden="true" /> Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" aria-hidden="true" /> Copy
            </>
          )}
        </Button>
      </div>

      <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
        {kind === "sourcing"
          ? "We're on it. Our team reviews your requirement, confirms specs and availability with the asset owner, and follows up by email with next steps or an offer."
          : "Thank you. Our team reviews what you sent, then contacts you to confirm availability, condition, and what may be marketed. Nothing is published without your approval."}
      </p>

      <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <Search className="size-4 shrink-0 text-muted-foreground/60" aria-hidden="true" />
          Check progress any time on{" "}
          <Link href="/track" className="link-quiet font-medium">
            the tracking page
          </Link>
          <span>with this number and your email</span>
        </li>
        <li className="flex items-center gap-2">
          <Mail className="size-4 shrink-0 text-muted-foreground/60" aria-hidden="true" />
          Follow up any time:{" "}
          <a href={`mailto:${SITE.email}`} className="link-quiet font-medium">
            {SITE.email}
          </a>
        </li>
        <li className="flex items-center gap-2">
          <Phone className="size-4 shrink-0 text-muted-foreground/60" aria-hidden="true" />
          <a href={`tel:${SITE.phoneHref}`} className="text-part link-quiet font-medium">
            {SITE.phone}
          </a>
          <span>— quote your reference number</span>
        </li>
      </ul>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href={kind === "sourcing" ? "/sell" : "/request-equipment"}>
            {kind === "sourcing" ? "List your equipment" : "Request equipment"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
