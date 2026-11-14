"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/site/logo";
import { SECTORS } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/equipment", label: "Equipment" },
  { href: "/sell", label: "List equipment" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const sectorActive = SECTORS.some((s) => isActive(`/sectors/${s.slug}`));

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" aria-label="Zuronix home" className="shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-ring">
          <Logo withTagline />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "inline-flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground",
                  sectorActive && "text-foreground"
                )}
              >
                Sectors
                <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {SECTORS.map((s) => (
                <DropdownMenuItem key={s.slug} asChild>
                  <Link
                    href={`/sectors/${s.slug}`}
                    className={cn(
                      "flex cursor-pointer flex-col items-start gap-0.5",
                      isActive(`/sectors/${s.slug}`) && "text-primary"
                    )}
                  >
                    <span className="text-sm font-medium">{s.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {s.shortName === "Semiconductor"
                        ? "Test, dicing, packaging, parts"
                        : s.shortName === "Data center"
                          ? "Servers, storage, networking"
                          : "Machining, inspection, cooling"}
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground",
                isActive(item.href) && "text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/request-equipment">Request equipment</Link>
          </Button>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-10 items-center justify-center rounded-md text-foreground hover:bg-accent lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      {open && (
        <nav
          aria-label="Mobile"
          className="border-t border-border bg-background px-4 pb-6 pt-3 lg:hidden"
        >
          <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sectors
          </p>
          {SECTORS.map((s) => (
            <Link
              key={s.slug}
              href={`/sectors/${s.slug}`}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2.5 text-[15px] font-medium text-foreground/90 hover:bg-accent"
            >
              {s.name}
            </Link>
          ))}
          <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Site
          </p>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2.5 text-[15px] font-medium text-foreground/90 hover:bg-accent"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-4 grid gap-2 px-3">
            <Button asChild>
              <Link href="/request-equipment" onClick={() => setOpen(false)}>
                Request equipment
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/sell" onClick={() => setOpen(false)}>
                List your equipment
              </Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
