"use client";

import { useCallback, useRef, useState } from "react";

export type LeadType = "SOURCING" | "SURPLUS_SINGLE" | "SURPLUS_LIST";

export interface SubmissionResult {
  reference: string;
  duplicate: boolean;
}

interface UseLeadSubmission {
  pending: boolean;
  error: string | null;
  result: SubmissionResult | null;
  submit: (values: Record<string, unknown>, file?: File | null) => Promise<boolean>;
}

function newToken(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `tok-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useLeadSubmission(type: LeadType): UseLeadSubmission {
  // One token per form session: retries and double-clicks can never
  // create two requests — the server returns the existing reference.
  const tokenRef = useRef<string>(newToken());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmissionResult | null>(null);

  const submit = useCallback(
    async (values: Record<string, unknown>, file?: File | null) => {
      setPending(true);
      setError(null);
      try {
        const body = new FormData();
        body.set("token", tokenRef.current);
        body.set("type", type);
        body.set("payload", JSON.stringify(values));
        if (file) body.set("file", file);

        const res = await fetch("/api/requests", { method: "POST", body });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data?.ok && data?.reference) {
          setResult({ reference: data.reference, duplicate: Boolean(data.duplicate) });
          return true;
        }
        setError(
          data?.error ??
            "We couldn't send your request. Your entries are still here — check your connection and try again."
        );
        return false;
      } catch {
        // Network failure (connection dropped, offline): keep all data
        // so the customer can retry without retyping.
        setError(
          "We couldn't reach the server — nothing was lost. Check your connection and press Send again."
        );
        return false;
      } finally {
        setPending(false);
      }
    },
    [type]
  );

  return { pending, error, result, submit };
}
