import { cn } from "@/lib/cn";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const toneMap: Record<Tone, string> = {
  neutral:
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700",
  success:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-800",
  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-500 border border-amber-200 dark:border-amber-800",
  danger:
    "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
};

export function Badge({
  tone = "neutral",
  className,
  children,
  icon,
}: {
  tone?: Tone;
  className?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        "transition-all duration-200 shadow-sm hover:shadow",
        "backdrop-blur-sm",
        toneMap[tone],
        className
      )}
    >
      {icon && <span className="text-sm opacity-80">{icon}</span>}
      {children}
    </span>
  );
}
