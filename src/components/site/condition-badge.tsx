import { Badge } from "@/components/ui/badge";
import { CONDITIONS } from "@/lib/site";
import { cn } from "@/lib/utils";

export function ConditionBadge({ conditionKey, className }: { conditionKey: string; className?: string }) {
  const c = CONDITIONS[conditionKey];
  const tone =
    c?.tone === "positive"
      ? "border-primary/25 bg-primary/10 text-primary"
      : c?.tone === "caution"
        ? "border-amber-600/30 bg-amber-50 text-amber-800"
        : "border-border bg-muted text-foreground/80";
  return (
    <Badge variant="outline" className={cn("font-medium", tone, className)}>
      {c?.label ?? conditionKey}
    </Badge>
  );
}
