import { cn } from "@/lib/cn";
import { forwardRef } from "react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

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

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, disabled, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      disabled={disabled}
      className={cn(
        // Base shape
        "h-4 w-4 rounded-md border transition-colors text-gray-700",

        // Border
        "border-slate-300 dark:border-slate-600",

        // Checked state (matches button blue)
        "checked:bg-blue-600 checked:border-blue-600",
        "dark:checked:bg-blue-500 dark:checked:border-blue-500",

        // Hover
        "hover:border-slate-400 dark:hover:border-slate-500",

        // Focus ring (same as Button)
        "focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-blue-500",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "dark:focus-visible:ring-offset-slate-950",

        // Disabled
        "disabled:opacity-50 disabled:cursor-not-allowed",

        className
      )}
      {...props}
    />
  )
);
Checkbox.displayName = "Checkbox";
