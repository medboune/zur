"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Download, Inbox, LogOut, Package, Settings } from "lucide-react";
import { Logo } from "@/components/site/logo";

const TABS = [
  { href: "/admin", label: "Requests", icon: Inbox, exact: true },
  { href: "/admin/equipment", label: "Equipment", icon: Package, exact: false },
  { href: "/admin/settings", label: "Settings", icon: Settings, exact: true },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-5">
          <Link href="/admin" aria-label="Zuronix operations console">
            <Logo />
          </Link>
          <nav aria-label="Console sections" className="hidden items-center gap-1 sm:flex">
            {TABS.map((tab) => {
              const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <tab.icon className="size-4" aria-hidden="true" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/export"
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Download className="size-3.5" aria-hidden="true" />
            Export CSV
          </Link>
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
      {/* Mobile section switcher */}
      <nav aria-label="Console sections" className="flex gap-1 border-t border-border px-4 py-2 sm:hidden">
        {TABS.map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium ${
                active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-accent"
              }`}
            >
              <tab.icon className="size-3.5" aria-hidden="true" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
