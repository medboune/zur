"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Inbox, LogOut } from "lucide-react";

export function AdminNav() {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-7 place-items-center rounded-[5px] bg-primary font-mono text-sm font-semibold text-primary-foreground"
          >
            Z
          </span>
          <Link href="/admin" className="flex items-center gap-2 text-sm font-semibold">
            <Inbox className="size-4 text-primary" aria-hidden="true" />
            Requests console
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            View site
          </Link>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <LogOut className="size-3.5" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
