import { cn } from "@/lib/cn";
import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 " +
  "focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 " +
  "disabled:opacity-60 disabled:cursor-not-allowed active:translate-y-px";

const variants: Record<ButtonVariant, string> = {
  primary:
    // solid brand color, no shadow
    "bg-blue-100 text-gray-900 hover:bg-blue-700 active:bg-blue-800 ",
  secondary:
    // soft neutral background
    "bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 " +
    "dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700",
  ghost:
    // transparent with subtle hover
    "bg-transparent text-slate-900 hover:bg-slate-100 active:bg-slate-200 " +
    "dark:text-slate-50 dark:hover:bg-slate-800 dark:active:bg-slate-700",
  outline:
    // neutral outline only
    "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 active:bg-slate-100 " +
    "dark:border-slate-700 dark:bg-transparent dark:text-slate-500 dark:hover:bg-slate-800",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 " +
    "disabled:bg-red-400 dark:bg-red-500 dark:hover:bg-red-600 dark:active:bg-red-700",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
  icon: "h-10 w-10 p-0",
};

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

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const showLeftIcon = !isLoading && leftIcon;
    const showRightIcon = !isLoading && rightIcon;

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        aria-busy={isLoading || undefined}
        disabled={isDisabled}
        {...props}
      >
        {isLoading && (
          <span
            className={cn(
              "inline-flex h-4 w-4 items-center justify-center ",
              size === "lg" && "h-5 w-5"
            )}
          >
            <svg
              className="h-full w-full animate-spin"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </span>
        )}

        {showLeftIcon && (
          <span className="inline-flex items-center text-red-500">
            {leftIcon}
          </span>
        )}

        <span className="whitespace-nowrap">
          {isLoading ? "Loading…" : children}
        </span>

        {showRightIcon && (
          <span className="inline-flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
