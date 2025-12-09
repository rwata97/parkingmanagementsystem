import { cn } from "@/lib/cn";
import { forwardRef } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}
/**
 * NOTE ABOUT forwardRef:
 *
 * This component uses React.forwardRef to expose the underlying DOM element
 * (e.g., <input>, <button>, <select>) to parent components.
 *
 * Why this is needed:
 * - Allows parent components / forms to programmatically focus the element
 *   (e.g., ref.current?.focus()).
 * - Allows integration with UI libraries or hooks that expect a ref
 *   (e.g., react-hook-form, custom focus traps, scroll/measure utilities).
 * - Keeps this component flexible and composable while still being a styled wrapper.
 *
 * In short: forwardRef preserves the ability to treat this as a real DOM element
 * while still giving us abstraction + styling.
 */

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border bg-white px-3 py-2 text-sm  text-gray-600 shadow-sm",
        "placeholder:text-gray-400 focus:outline-none focus:ring-2",
        invalid
          ? "border-red-500 focus:ring-red-500"
          : "border-gray-300 focus:ring-blue-600",
        "disabled:cursor-not-allowed disabled:bg-gray-100",
        className
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  )
);
Input.displayName = "Input";
