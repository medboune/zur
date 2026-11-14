"use client";

import { useActionState } from "react";
import { AlertCircle, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lookupRequest, type TrackResult } from "@/app/(site)/track/actions";

const inputCls =
  "mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30";

const STEPS = [
  { key: "NEW", label: "Received", detail: "Your request is in the queue. Most are picked up within one business day." },
  {
    key: "IN_REVIEW",
    label: "Under review",
    detail: "We're verifying specifications, availability and condition, and preparing your quote.",
  },
  {
    key: "QUOTED",
    label: "Quote sent",
    detail: "We've emailed you a quote. Check your inbox (and spam folder) and reply to accept or ask questions.",
  },
  { key: "WON", label: "Completed", detail: "This deal is complete. Thank you for working with Zuronix." },
];

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  });
}

function StatusView({ r }: { r: Extract<TrackResult, { ok: true }> }) {
  const closed = r.status === "CLOSED";
  const current = Math.max(0, STEPS.findIndex((s) => s.key === r.status));
  return (
    <section aria-live="polite" className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-part text-lg font-semibold text-primary">{r.reference}</p>
        <p className="text-sm text-muted-foreground">
          Submitted {fmt(r.submittedAt)} · Last update {fmt(r.updatedAt)}
        </p>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {r.kind === "sourcing" ? "Sourcing request" : "Equipment offer"}: <span className="text-foreground">{r.summary}</span>
      </p>

      {closed ? (
        <p className="mt-6 rounded-lg border border-border bg-secondary/40 p-4 text-sm leading-relaxed">
          This request is closed. If you still need help, reply to our last email or submit a new request — we&apos;re
          happy to pick it up again.
        </p>
      ) : (
        <ol className="mt-6 space-y-5">
          {STEPS.map((s, i) => {
            const done = i < current || (i === current && s.key === "WON");
            const active = i === current && s.key !== "WON";
            return (
              <li key={s.key} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-xs font-semibold ${
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : active
                        ? "border-primary text-primary ring-4 ring-primary/15"
                        : "border-border text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="size-3.5" /> : i + 1}
                </span>
                <div>
                  <p className={`font-medium ${i > current ? "text-muted-foreground" : ""}`}>
                    {s.label}
                    {active && <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-primary">Current</span>}
                  </p>
                  {i === current && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.detail}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

export function TrackForm() {
  const [state, action, pending] = useActionState(lookupRequest, null);
  return (
    <>
      <form action={action} className="mt-8 grid gap-4 rounded-xl border border-border bg-card p-6 shadow-sm sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Reference number</span>
          <input
            name="reference"
            required
            autoComplete="off"
            spellCheck={false}
            placeholder="ZQ-261113-7K4MQ"
            className={`${inputCls} text-part uppercase`}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Email used for the request</span>
          <input name="email" type="email" required autoComplete="email" placeholder="you@company.com" className={inputCls} />
        </label>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={pending}>
            <Search className="size-4" aria-hidden="true" />
            {pending ? "Checking…" : "Check status"}
          </Button>
        </div>
        {state && !state.ok && (
          <p role="alert" className="flex items-start gap-2 text-sm text-destructive sm:col-span-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {state.error}
          </p>
        )}
      </form>
      {state?.ok && <StatusView r={state} />}
    </>
  );
}
