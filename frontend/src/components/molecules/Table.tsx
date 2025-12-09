import { cn } from "@/lib/cn";

export function Table({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn(
        "w-full border-separate border-spacing-0 text-sm",
        "text-slate-900 dark:text-slate-100",
        className
      )}
      {...props}
    />
  );
}

export function Thead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />;
}

export function Tbody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

export function Tr({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("even:bg-slate-50 dark:even:bg-slate-800/30", className)}
      {...props}
    />
  );
}

export function Th({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "sticky top-0 z-10 bg-slate-100 dark:bg-slate-800",
        "border-b border-slate-200 dark:border-slate-700",
        "px-3 py-2 text-left text-sm font-medium tracking-tight",
        "text-slate-700 dark:text-slate-200",
        className
      )}
      {...props}
    />
  );
}

export function Td({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "border-b border-slate-200 dark:border-slate-700",
        "px-3 py-2 align-middle text-slate-800 dark:text-slate-500",
        className
      )}
      {...props}
    />
  );
}
