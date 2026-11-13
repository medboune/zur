"use client";

import { Trash2 } from "lucide-react";
import { deleteEquipment } from "@/app/admin/actions";

export function EquipmentDeleteButton({
  equipmentId,
  name,
}: {
  equipmentId: number;
  name: string;
}) {
  return (
    <form
      action={deleteEquipment}
      onSubmit={(e) => {
        if (!window.confirm(`Delete "${name}" permanently? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={equipmentId} />
      <button
        type="submit"
        className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-background px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
        aria-label={`Delete ${name}`}
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
      </button>
    </form>
  );
}
