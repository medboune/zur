"use client";

import { useState } from "react";
import { FieldShell, TextInput, TextArea, FileField, FormErrorBanner, PrivacyNote, SubmitButton, SelectInput, useFieldIds } from "@/components/site/form/fields";
import { useLeadSubmission } from "@/components/site/form/use-lead-submission";
import { Confirmation } from "@/components/site/form/confirmation";
import { surplusSingleSchema, fieldErrors } from "@/lib/form-schemas";
import { CONDITIONS } from "@/lib/site";

export function SurplusSingleForm() {
  const ids = useFieldIds("sur1");
  const { pending, error, result, submit } = useLeadSubmission("SURPLUS_SINGLE");

  const [form, setForm] = useState({
    manufacturer: "",
    model: "",
    quantity: "1",
    condition: "",
    itemLocation: "",
    year: "",
    configuration: "",
    askingPrice: "",
    notes: "",
    company: "",
    contactName: "",
    email: "",
    phone: "",
    website: "", // honeypot — humans never see this field
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (result) return <Confirmation result={result} kind="surplus" />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = surplusSingleSchema.safeParse({ ...form, quantity: Number(form.quantity) });
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
        <legend className="mb-1 text-base font-semibold">The equipment</legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <FieldShell label="Manufacturer" htmlFor={ids("manufacturer")} required error={errors.manufacturer}>
            <TextInput id={ids("manufacturer")} value={form.manufacturer} onChange={set("manufacturer")} placeholder="e.g., Haas" error={Boolean(errors.manufacturer)} />
          </FieldShell>
          <FieldShell label="Model" htmlFor={ids("model")} required error={errors.model}>
            <TextInput id={ids("model")} value={form.model} onChange={set("model")} className="text-part" placeholder="e.g., VF-2SS" error={Boolean(errors.model)} />
          </FieldShell>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FieldShell label="Quantity" htmlFor={ids("quantity")} required error={errors.quantity}>
            <TextInput id={ids("quantity")} type="number" min={1} step={1} value={form.quantity} onChange={set("quantity")} error={Boolean(errors.quantity)} />
          </FieldShell>
          <FieldShell label="Year" htmlFor={ids("year")} error={errors.year}>
            <TextInput id={ids("year")} value={form.year} onChange={set("year")} placeholder="e.g., 2018" error={Boolean(errors.year)} />
          </FieldShell>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FieldShell
            label="Condition"
            htmlFor={ids("condition")}
            required
            error={errors.condition}
            hint="Your honest assessment — untested is fine, we just need to know."
          >
            <SelectInput id={ids("condition")} value={form.condition} onChange={set("condition")} error={Boolean(errors.condition)}>
              <option value="">Select condition…</option>
              {Object.entries(CONDITIONS).map(([key, c]) => (
                <option key={key} value={key}>
                  {c.label}
                </option>
              ))}
            </SelectInput>
          </FieldShell>
          <FieldShell label="Equipment location" htmlFor={ids("itemLocation")} required error={errors.itemLocation} hint="City, state / country">
            <TextInput id={ids("itemLocation")} value={form.itemLocation} onChange={set("itemLocation")} placeholder="e.g., Portland, OR" error={Boolean(errors.itemLocation)} />
          </FieldShell>
        </div>

        <FieldShell label="Configuration / accessories" htmlFor={ids("configuration")} error={errors.configuration} hint="Control options, tooling, hours, included fixtures…">
          <TextArea id={ids("configuration")} value={form.configuration} onChange={set("configuration")} className="min-h-20" error={Boolean(errors.configuration)} />
        </FieldShell>

        <FileField
          id={ids("file")}
          accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt"
          label="Photos or inspection report"
          hint="A few photos help us value it accurately. PDF report if you have one. Up to 10 MB."
          file={file}
          onFile={setFile}
          error={errors.file}
        />

        <FieldShell label="Asking price" htmlFor={ids("askingPrice")} error={errors.askingPrice} hint="Optional — or ask us for a market view first.">
          <TextInput id={ids("askingPrice")} value={form.askingPrice} onChange={set("askingPrice")} placeholder="e.g., $55,000 or 'advise me'" error={Boolean(errors.askingPrice)} />
        </FieldShell>

        <FieldShell label="Notes" htmlFor={ids("notes")} error={errors.notes}>
          <TextArea id={ids("notes")} value={form.notes} onChange={set("notes")} className="min-h-20" placeholder="Rigging, storage, why it's available…" error={Boolean(errors.notes)} />
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
        We review your submission, then contact you to confirm details and agree what may be
        marketed and how. Your contact details, serial numbers, and documents stay private —
        nothing is published without your written approval.
      </PrivacyNote>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton pending={pending} label="Submit for review" />
        <p className="text-xs text-muted-foreground sm:ml-1">
          No account needed. You&apos;ll get a reference number for this submission.
        </p>
      </div>
    </form>
  );
}
