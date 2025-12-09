import { cn } from "@/lib/cn";

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("my-4 border-gray-200", className)} />;
}
