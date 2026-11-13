"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { REQUEST_STATUSES } from "@/lib/site";

export async function updateLead(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdminAuthenticated())) {
    return { ok: false, error: "Your session expired — sign in again." };
  }

  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  const adminNotes = String(formData.get("adminNotes") ?? "");

  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "Invalid request id." };
  if (!REQUEST_STATUSES.includes(status)) return { ok: false, error: "Invalid status." };

  const existing = await db.lead.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Request not found." };

  await db.lead.update({
    where: { id },
    data: {
      status,
      adminNotes: adminNotes.slice(0, 5000) || null,
    },
  });

  revalidatePath(`/admin/requests/${id}`);
  revalidatePath("/admin");
  return { ok: true };
}
