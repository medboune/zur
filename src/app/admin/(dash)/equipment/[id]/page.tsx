import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { EquipmentForm } from "@/components/admin/equipment-form";

export const dynamic = "force-dynamic";

export default async function AdminEquipmentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  let item = null;
  if (!isNew) {
    const numericId = Number(id);
    if (!Number.isInteger(numericId)) notFound();
    item = await db.equipment.findUnique({ where: { id: numericId } });
    if (!item) notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/equipment"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All listings
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isNew ? "New listing" : (
            <>
              {item!.manufacturer} <span className="text-part">{item!.model}</span>
            </>
          )}
        </h1>
        {!isNew && <span className="text-part text-sm text-muted-foreground">{item!.reference}</span>}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {isNew
          ? "Create a catalog listing — it appears on the site as soon as you publish it."
          : "Changes go live immediately after saving (published listings)."}
      </p>

      <div className="mt-6">
        <EquipmentForm item={item} />
      </div>
    </div>
  );
}
