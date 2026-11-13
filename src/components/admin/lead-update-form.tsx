"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { updateLead } from "@/app/admin/actions";
import { REQUEST_STATUSES, REQUEST_STATUS_LABELS } from "@/lib/site";

export function LeadUpdateForm({
  leadId,
  status,
  adminNotes,
}: {
  leadId: number;
  status: string;
  adminNotes: string;
}) {
  const [state, formAction, pending] = useActionState(updateLead, null);

  return (
    <form action={formAction} className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="font-semibold">Workflow</h2>
      <input type="hidden" name="id" value={leadId} />

      <label htmlFor={`status-${leadId}`} className="mt-4 block text-sm font-medium">
        Status
      </label>
      <select
        id={`status-${leadId}`}
        name="status"
        defaultValue={status}
        className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
      >
        {REQUEST_STATUSES.map((s) => (
          <option key={s} value={s}>
            {REQUEST_STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <label htmlFor={`notes-${leadId}`} className="mt-4 block text-sm font-medium">
        Internal notes
      </label>
      <textarea
        id={`notes-${leadId}`}
        name="adminNotes"
        defaultValue={adminNotes}
        rows={4}
        placeholder="Who's handling it, what was agreed, next step…"
        className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
      />

      <button
        type="submit"
        disabled={pending}
        className="mt-4 h-10 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>

      {state?.ok && (
        <p role="status" className="mt-3 flex items-center gap-1.5 text-sm text-primary">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          Saved.
        </p>
      )}
      {state && !state.ok && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Status changes appear in the dashboard immediately. Customers never see this screen.
      </p>
    </form>
  );
}
