import { cn } from "@/lib/cn";
import { forwardRef } from "react";

export interface RadioProps
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

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="radio"
      className={cn(
        "h-4 w-4 rounded-full border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-600",
        className
      )}
      {...props}
    />
  )
);
Radio.displayName = "Radio";
