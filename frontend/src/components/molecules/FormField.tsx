import { Label, Text } from "../atoms";
import { cn } from "@/lib/cn";

type Props = {
  label: string;
  htmlFor: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
};

export function FormField({
  label,
  htmlFor,
  required,
  helpText,
  error,
  children,
  className,
}: Props) {
  const helpId = helpText ? `${htmlFor}-help` : undefined;
  const errId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {helpText ? (
        <Text id={helpId} className="text-gray-500">
          {helpText}
        </Text>
      ) : null}
      {error ? (
        <Text id={errId} className="text-red-600">
          {error}
        </Text>
      ) : null}
    </div>
  );
}
