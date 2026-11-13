import { cn } from "@/lib/utils";

/**
 * Zuronix wordmark — industrial, engineered feel:
 * heavy display caps with wide tracking, a square accent dot (the "ix"
 * terminal), and an optional descriptor used in the header.
 */
export function Logo({
  inverted = false,
  withTagline = false,
  className,
}: {
  inverted?: boolean;
  withTagline?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        className={cn(
          "font-display inline-block text-[21px] font-extrabold uppercase leading-none tracking-[0.09em]",
          inverted ? "text-white" : "text-foreground"
        )}
      >
        Zuronix
        <span
          aria-hidden="true"
          className="ml-1 inline-block size-[7px] translate-y-[-1px] rounded-[1.5px] bg-primary align-baseline"
        />
      </span>
      {withTagline && (
        <>
          <span
            aria-hidden="true"
            className={cn("hidden h-7 w-px sm:block", inverted ? "bg-white/25" : "bg-border")}
          />
          <span
            className={cn(
              "hidden font-mono text-[9.5px] font-medium uppercase leading-[1.4] tracking-[0.16em] sm:block",
              inverted ? "text-white/55" : "text-muted-foreground"
            )}
          >
            Industrial Sourcing
            <br />&amp; Sales
          </span>
        </>
      )}
    </span>
  );
}
