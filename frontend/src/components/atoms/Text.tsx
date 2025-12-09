import { cn } from "@/lib/cn";

type TextProps = {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
};

export function Text({
  as: Comp = "p",
  className,
  children,
  ...rest
}: TextProps) {
  return (
    <Comp className={cn("text-sm text-gray-700", className)} {...rest}>
      {children}
    </Comp>
  );
}

export function Muted({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("text-sm text-gray-500", className)}>{children}</p>;
}
