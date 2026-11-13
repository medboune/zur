"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
        return;
      }
      setError("Incorrect password. Try again or contact your administrator.");
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-md bg-primary font-mono text-sm font-semibold text-primary-foreground"
          >
            Z
          </span>
          <div>
            <p className="font-semibold leading-tight">Zuronix Operations</p>
            <p className="text-xs text-muted-foreground">Requests console</p>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <label htmlFor="admin-password" className="text-sm font-medium">
            Team password
          </label>
          <div className="relative mt-2">
            <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-md border border-input bg-background py-2.5 pl-9 pr-3 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              placeholder="••••••••••"
            />
          </div>
          {error && (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending || !password}
            className="mt-4 h-10 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {pending ? "Checking…" : "Sign in"}
          </button>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            For Zuronix team members. Every sign-in is required to view customer requests and
            attachments.
          </p>
        </form>
      </div>
    </div>
  );
}
