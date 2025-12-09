import { Input } from "@/components/atoms";
import { FormField } from "./FormField";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  required?: boolean;
  helpText?: string;
  error?: string;
};

export function TextField({
  id,
  label,
  required,
  helpText,
  error,
  ...props
}: Props) {
  const describedBy =
    [helpText && `${id}-help`, error && `${id}-error`]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <FormField
      htmlFor={id}
      label={label}
      required={required}
      helpText={helpText}
      error={error}
    >
      <Input
        id={id}
        aria-describedby={describedBy}
        aria-invalid={!!error || undefined}
        invalid={!!error}
        {...props}
      />
    </FormField>
  );
}
