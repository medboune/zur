import { cn } from "@/lib/utils";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className="grid size-7 shrink-0 place-items-center rounded-[5px] bg-primary font-mono text-sm font-semibold text-primary-foreground"
      >
        Z
      </span>
      <span
        className={cn(
          "text-lg font-semibold tracking-tight",
          inverted ? "text-brand-ink-foreground" : "text-foreground"
        )}
      >
        Zuronix
      </span>
    </span>
  );
}
