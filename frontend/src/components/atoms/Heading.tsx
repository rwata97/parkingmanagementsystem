import { cn } from "@/lib/cn";

type Level = 1 | 2 | 3 | 4;
type HeadingTag = "h1" | "h2" | "h3" | "h4";

export function Heading({
  level = 1,
  className,
  children,
}: {
  level?: Level;
  className?: string;
  children: React.ReactNode;
}) {
  const Tag = `h${level}` as HeadingTag;

  const sizes: Record<Level, string> = {
    1: "text-2xl md:text-3xl font-semibold tracking-tight",
    2: "text-xl md:text-2xl font-semibold tracking-tight",
    3: "text-lg md:text-xl font-medium tracking-tight",
    4: "text-base md:text-lg font-medium tracking-tight",
  };

  return (
    <Tag className={cn("text-gray-600 ", sizes[level], className)}>
      {children}
    </Tag>
  );
}
