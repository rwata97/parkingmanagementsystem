import { cn } from "@/lib/cn";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ className, children, required, ...props }: LabelProps) {
  return (
    <label
      className={cn("mb-1 block text-sm font-medium text-gray-800", className)}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-red-600" aria-hidden>
          *
        </span>
      )}
    </label>
  );
}
