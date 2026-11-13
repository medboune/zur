"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import {
  updateAdminEmail,
  updateAdminPassword,
  updateAdminUsername,
  type ActionResult,
} from "@/app/admin/actions";

const inputCls =
  "mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30";

function Feedback({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  if (state.ok) {
    return (
      <p role="status" className="mt-2 flex items-center gap-1.5 text-sm text-primary">
        <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
        Saved.
      </p>
    );
  }
  return (
    <p role="alert" className="mt-2 flex items-start gap-1.5 text-sm text-destructive">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {state.error}
    </p>
  );
}

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-3 h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

export function UsernameForm({ current }: { current: string }) {
  const [state, action, pending] = useActionState(updateAdminUsername, null);
  return (
    <form action={action}>
      <label htmlFor="settings-username" className="text-sm font-medium">
        Username
      </label>
      <p className="mt-0.5 text-xs text-muted-foreground">
        3–32 characters: lowercase letters, numbers, dots, dashes, underscores. Used to sign in.
      </p>
      <input
        id="settings-username"
        name="username"
        defaultValue={current}
        required
        autoCapitalize="none"
        spellCheck={false}
        className={inputCls}
      />
      <Feedback state={state} />
      <SubmitButton pending={pending} label="Update username" />
    </form>
  );
}

export function EmailForm({ current }: { current: string }) {
  const [state, action, pending] = useActionState(updateAdminEmail, null);
  return (
    <form action={action}>
      <label htmlFor="settings-email" className="text-sm font-medium">
        Email address
      </label>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Where operational notifications about this console are addressed.
      </p>
      <input
        id="settings-email"
        name="email"
        type="email"
        defaultValue={current}
        required
        autoCapitalize="none"
        spellCheck={false}
        className={inputCls}
      />
      <Feedback state={state} />
      <SubmitButton pending={pending} label="Update email" />
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(updateAdminPassword, null);
  return (
    <form action={action}>
      <label htmlFor="settings-current-password" className="text-sm font-medium">
        Current password
      </label>
      <input
        id="settings-current-password"
        name="currentPassword"
        type="password"
        required
        autoComplete="current-password"
        className={inputCls}
      />
      <label htmlFor="settings-new-password" className="mt-4 block text-sm font-medium">
        New password
      </label>
      <p className="mt-0.5 text-xs text-muted-foreground">
        At least 8 characters, including a letter and a number.
      </p>
      <div className="relative">
        <input
          id="settings-new-password"
          name="newPassword"
          type="password"
          required
          autoComplete="new-password"
          className={`${inputCls} pr-10`}
        />
        <PasswordToggle targetId="settings-new-password" />
      </div>
      <label htmlFor="settings-confirm-password" className="mt-4 block text-sm font-medium">
        Confirm new password
      </label>
      <div className="relative">
        <input
          id="settings-confirm-password"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className={`${inputCls} pr-10`}
        />
        <PasswordToggle targetId="settings-confirm-password" />
      </div>
      <Feedback state={state} />
      <SubmitButton pending={pending} label="Change password" />
      <p className="mt-2 text-xs text-muted-foreground">
        Changing the password signs out every other session.
      </p>
    </form>
  );
}

function PasswordToggle({ targetId }: { targetId: string }) {
  return (
    <button
      type="button"
      aria-label="Show or hide password"
      aria-controls={targetId}
      onClick={() => {
        const input = document.getElementById(targetId) as HTMLInputElement | null;
        if (!input) return;
        input.type = input.type === "password" ? "text" : "password";
      }}
      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
    >
      <Eye className="size-4" aria-hidden="true" />
    </button>
  );
}
