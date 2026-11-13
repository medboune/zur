"use client";

import { useRef } from "react";
import { Search } from "lucide-react";

export function SearchBox({ defaultValue = "" }: { defaultValue?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      action="/equipment"
      method="get"
      role="search"
      onSubmit={() => {
        // keep the value; server page reads ?q=
      }}
      className="flex w-full items-center gap-2 rounded-lg border border-border bg-card p-1.5 pl-3.5 shadow-sm focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30"
    >
      <label htmlFor="site-search" className="sr-only">
        Search by manufacturer, model or part number
      </label>
      <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <input
        ref={inputRef}
        id="site-search"
        name="q"
        type="search"
        autoComplete="off"
        defaultValue={defaultValue}
        placeholder="Search by manufacturer, model or part number"
        className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-ring"
      >
        Search
      </button>
    </form>
  );
}
