"use client";

import { useState } from "react";
import { FieldShell, TextInput, TextArea, FileField, FormErrorBanner, PrivacyNote, SubmitButton, useFieldIds } from "@/components/site/form/fields";
import { useLeadSubmission } from "@/components/site/form/use-lead-submission";
import { Confirmation } from "@/components/site/form/confirmation";
import { surplusListSchema, surplusListBaseSchema, fieldErrors } from "@/lib/form-schemas";

export function SurplusListForm() {
  const ids = useFieldIds("surlist");
  const { pending, error, result, submit } = useLeadSubmission("SURPLUS_LIST");

  const [form, setForm] = useState({
    listSummary: "",
    pastedList: "",
    itemLocation: "",
    notes: "",
    company: "",
    contactName: "",
    email: "",
    phone: "",
    website: "", // honeypot — humans never see this field
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (result) return <Confirmation result={result} kind="surplus" />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // An uploaded file substitutes for pasted rows.
    const schema = file ? surplusListBaseSchema : surplusListSchema;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      if (firstKey) document.getElementById(ids(firstKey))?.focus();
      return;
    }
    setErrors({});
    await submit({ ...parsed.data, website: form.website }, file);
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {/* Honeypot: invisible to humans, attractive to bots. Server rejects silently. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor={ids("website")}>Website</label>
        <input
          id={ids("website")}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={set("website")}
        />
      </div>
      <FormErrorBanner message={error} />

      <fieldset className="space-y-5" disabled={pending}>
        <legend className="mb-1 text-base font-semibold">Your inventory list</legend>

        <FileField
          id={ids("file")}
          accept=".csv,.xlsx,.xls,.pdf,.txt"
          label="Upload your list"
          hint="CSV or Excel — any layout works. Manufacturer, model, quantity, and condition are enough to start. Up to 10 MB."
          file={file}
          onFile={setFile}
          error={errors.file}
          required={false}
        />

        <FieldShell
          label="Or paste your list"
          htmlFor={ids("pastedList")}
          error={errors.pastedList}
          hint="No file handy? Paste the rows or a rough list — we'll take it from there."
        >
          <TextArea
            id={ids("pastedList")}
            value={form.pastedList}
            onChange={set("pastedList")}
            className="min-h-32 text-part text-[13px]"
            placeholder={"Haas VF-2SS, 2018, 1, tested, Portland OR\nDell R740xd, 12 units, tested, Quincy WA\n…"}
            error={Boolean(errors.pastedList)}
          />
        </FieldShell>

        <div className="grid gap-5 sm:grid-cols-2">
          <FieldShell label="What's in the list" htmlFor={ids("listSummary")} error={errors.listSummary} hint="A one-line overview helps us route it.">
            <TextInput id={ids("listSummary")} value={form.listSummary} onChange={set("listSummary")} placeholder="e.g., 14 CNC machines, 2 chillers, tooling" error={Boolean(errors.listSummary)} />
          </FieldShell>
          <FieldShell label="Equipment location(s)" htmlFor={ids("itemLocation")} error={errors.itemLocation} hint="Site, city, or 'multiple sites'">
            <TextInput id={ids("itemLocation")} value={form.itemLocation} onChange={set("itemLocation")} placeholder="e.g., Reno, NV — single warehouse" error={Boolean(errors.itemLocation)} />
          </FieldShell>
        </div>

        <FieldShell label="Notes" htmlFor={ids("notes")} error={errors.notes} hint="Deadlines, inspection possibilities, site constraints…">
          <TextArea id={ids("notes")} value={form.notes} onChange={set("notes")} className="min-h-20" error={Boolean(errors.notes)} />
        </FieldShell>
      </fieldset>

      <fieldset className="space-y-5 border-t border-border pt-6" disabled={pending}>
        <legend className="mb-1 text-base font-semibold">How we reach you</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <FieldShell label="Company" htmlFor={ids("company")} required error={errors.company}>
            <TextInput id={ids("company")} value={form.company} onChange={set("company")} autoComplete="organization" error={Boolean(errors.company)} />
          </FieldShell>
          <FieldShell label="Your name" htmlFor={ids("contactName")} required error={errors.contactName}>
            <TextInput id={ids("contactName")} value={form.contactName} onChange={set("contactName")} autoComplete="name" error={Boolean(errors.contactName)} />
          </FieldShell>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FieldShell label="Work email" htmlFor={ids("email")} required error={errors.email}>
            <TextInput id={ids("email")} type="email" value={form.email} onChange={set("email")} autoComplete="email" placeholder="you@company.com" error={Boolean(errors.email)} />
          </FieldShell>
          <FieldShell label="Phone" htmlFor={ids("phone")} error={errors.phone}>
            <TextInput id={ids("phone")} type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" placeholder="+1 555 000 0000" error={Boolean(errors.phone)} />
          </FieldShell>
        </div>
      </fieldset>

      <PrivacyNote>
        Your list goes to our sourcing team only. We review it, contact you to confirm
        availability and condition, and agree in writing what may be marketed. Full serial
        numbers, customer identifiers, and the original file stay private — a list reaching
        us never becomes a public listing on its own.
      </PrivacyNote>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton pending={pending} label="Send the list" />
        <p className="text-xs text-muted-foreground sm:ml-1">
          One file, one submission — no per-item forms to fill.
        </p>
      </div>
    </form>
  );
}
