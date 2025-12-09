import { Button } from "@/components/atoms";
import { cn } from "@/lib/cn";

type Props = {
  children?: React.ReactNode;
  className?: string;
  onReset?: () => void;
  primaryAction?: { label: string; onClick: () => void };
};

export function Toolbar({
  children,
  className,
  onReset,
  primaryAction,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        "rounded-lg border border-slate-200 bg-white p-3",
        "dark:border-slate-700 dark:bg-slate-900/40",
        className
      )}
    >
      {/* Left side content */}
      <div className="flex flex-wrap items-center gap-2">{children}</div>

      <div className="flex items-center gap-2">
        {onReset && (
          <Button variant="ghost" onClick={onReset}>
            Reset
          </Button>
        )}

        {primaryAction && (
          <Button onClick={primaryAction.onClick}>{primaryAction.label}</Button>
        )}
      </div>
    </div>
  );
}
