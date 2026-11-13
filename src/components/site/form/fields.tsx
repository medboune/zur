"use client";

import { useId, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, FileUp, Paperclip, X } from "lucide-react";
import { humanFileSize, MAX_UPLOAD_BYTES } from "@/lib/form-schemas";
import { cn } from "@/lib/utils";

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm text-destructive">
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

interface FieldShellProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FieldShell({ label, htmlFor, required, hint, error, children, className }: FieldShellProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
        {required ? (
          <span className="ml-0.5 text-destructive" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">(optional)</span>
        )}
      </label>
      {hint && (
        <p id={`${htmlFor}-hint`} className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      )}
      <div className="mt-1.5">{children}</div>
      <FieldError id={`${htmlFor}-error`} message={error} />
    </div>
  );
}

const inputBase =
  "w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-60";

export function TextInput({
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      {...props}
      aria-invalid={error || undefined}
      className={cn(inputBase, error && "border-destructive focus:border-destructive focus:ring-destructive/20", className)}
    />
  );
}

export function TextArea({
  error,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      {...props}
      aria-invalid={error || undefined}
      className={cn(inputBase, "min-h-24 resize-y", error && "border-destructive focus:border-destructive focus:ring-destructive/20", className)}
    />
  );
}

export function SelectInput({
  error,
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select
      {...props}
      aria-invalid={error || undefined}
      className={cn(inputBase, "appearance-none pr-9", error && "border-destructive", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23555f68' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.6rem center",
      }}
    >
      {children}
    </select>
  );
}

interface FileFieldProps {
  id: string;
  accept: string;
  label: string;
  hint: string;
  file: File | null;
  onFile: (f: File | null) => void;
  error?: string;
  required?: boolean;
}

export function FileField({ id, accept, label, hint, file, onFile, error, required }: FileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (f.size > MAX_UPLOAD_BYTES) {
      setLocalError(`"${f.name}" is ${humanFileSize(f.size)} — the limit is 10 MB.`);
      onFile(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setLocalError(null);
    onFile(f);
  };

  const shownError = error ?? localError;

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required ? (
          <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>
        ) : (
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">(optional)</span>
        )}
      </label>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p>

      {file ? (
        <div className="mt-2 flex items-center justify-between gap-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2.5">
          <span className="flex min-w-0 items-center gap-2 text-sm">
            <Paperclip className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">
              {file.name} <span className="text-muted-foreground">· {humanFileSize(file.size)}</span>
            </span>
          </span>
          <button
            type="button"
            onClick={() => {
              onFile(null);
              setLocalError(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label={`Remove ${file.name}`}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-input bg-secondary/40 px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <FileUp className="size-5 text-primary/70" aria-hidden="true" />
          <span>
            <span className="font-medium text-foreground">Choose a file</span> — up to 10 MB
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        aria-invalid={shownError ? true : undefined}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <FieldError id={`${id}-error`} message={shownError ?? undefined} />
    </div>
  );
}

export function FormErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
    >
      <p className="flex items-start gap-2 font-medium">
        <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {message}
      </p>
    </div>
  );
}

export function PrivacyNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 px-4 py-3.5 text-sm leading-relaxed text-muted-foreground">
      <p className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
        <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
        Before you send
      </p>
      {children}
    </div>
  );
}

export function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
    >
      {pending && (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
        />
      )}
      {pending ? "Sending…" : label}
    </button>
  );
}

export function useFieldIds(prefix: string) {
  const id = useId();
  return (name: string) => `${prefix}-${id}-${name}`;
}
