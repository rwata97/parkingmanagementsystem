import { Label, Radio, Text } from "@/components/atoms";

type Item = { value: string; label: string; disabled?: boolean };
type Props = {
  name: string;
  label?: string;
  required?: boolean;
  items: Item[];
  value?: string;
  onChange?: (val: string) => void;
  error?: string;
  helpText?: string;
  inline?: boolean;
};

export function RadioGroup({
  name,
  label,
  required,
  items,
  value,
  onChange,
  error,
  helpText,
  inline,
}: Props) {
  const groupId = `${name}-group`;
  const helpId = helpText ? `${name}-help` : undefined;
  const errId = error ? `${name}-error` : undefined;
  const describedBy = [helpId, errId].filter(Boolean).join(" ") || undefined;

  return (
    <fieldset aria-describedby={describedBy} className="space-y-1.5">
      {label ? <Label required={required}>{label}</Label> : null}
      <div className={inline ? "flex flex-wrap gap-4" : "space-y-2"}>
        {items.map((it) => (
          <label key={it.value} className="inline-flex items-center gap-2">
            <Radio
              name={name}
              value={it.value}
              checked={value === it.value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={it.disabled}
              aria-invalid={!!error || undefined}
            />
            <span className="text-sm text-gray-800">{it.label}</span>
          </label>
        ))}
      </div>
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
    </fieldset>
  );
}
