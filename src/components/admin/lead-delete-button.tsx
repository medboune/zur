"use client";

import { Trash2 } from "lucide-react";
import { deleteLead } from "@/app/admin/actions";

export function LeadDeleteButton({ leadId, reference }: { leadId: number; reference: string }) {
  return (
    <form
      action={deleteLead}
      onSubmit={(e) => {
        if (!window.confirm(`Delete ${reference} permanently? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={leadId} />
      <button
        type="submit"
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
        Delete request
      </button>
    </form>
  );
}
