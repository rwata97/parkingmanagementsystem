import { Select } from "@/components/atoms";
import { FormField } from "./FormField";

type Option = { value: string; label: string; disabled?: boolean };
type Props = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "id"> & {
  id: string;
  label: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
};

export function SelectField({
  id,
  label,
  required,
  helpText,
  error,
  options,
  placeholder,
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
      <Select
        id={id}
        aria-describedby={describedBy}
        aria-invalid={!!error || undefined}
        invalid={!!error}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </Select>
    </FormField>
  );
}
