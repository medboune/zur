const CATEGORIES = [
  "Wafer probers",
  "Test handlers",
  "ATE systems",
  "Dicing saws",
  "Die & wire bonders",
  "CMP",
  "200/300mm spares",
  "Rack servers",
  "GPU nodes",
  "Storage arrays",
  "SAN switches",
  "PDUs & racks",
  "CNC machining centers",
  "Lathes",
  "PLC & controls",
  "Metrology",
  "Chillers",
  "Compressors",
  "Material handling",
];

/**
 * Slow horizontal marquee of the equipment categories we trade.
 * Pure CSS animation (pauses on hover, disabled with reduced motion);
 * hidden from assistive tech — it is decorative, the sector pages list
 * the same categories accessibly.
 */
export function CategoryTicker() {
  const row = [...CATEGORIES, ...CATEGORIES];
  return (
    <div
      className="ticker overflow-hidden border-b border-border bg-card"
      aria-hidden="true"
    >
      <div className="ticker-track flex w-max items-center">
        {row.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className="flex items-center whitespace-nowrap px-0 py-3 font-mono text-[11.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
          >
            {label}
            <span className="px-4 text-primary/60" aria-hidden="true">
              ·
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
