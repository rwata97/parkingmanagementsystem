import { Checkbox, Text } from "@/components/atoms";
import { cn } from "@/lib/cn";

type Item = { value: string; label: string; disabled?: boolean };

type Props = {
  name: string;
  label?: string;
  values: string[];
  onChange: (newValues: string[]) => void;
  items: Item[];
  helpText?: string;
  error?: string;
  inline?: boolean;
};

export function CheckboxGroup({
  name,
  label,
  values,
  onChange,
  items,
  helpText,
  error,
  inline,
}: Props) {
  const helpId = helpText ? `${name}-help` : undefined;
  const errId = error ? `${name}-error` : undefined;
  const describedBy = [helpId, errId].filter(Boolean).join(" ") || undefined;

  const toggle = (val: string) => {
    const set = new Set(values);
    set.has(val) ? set.delete(val) : set.add(val);
    onChange(Array.from(set));
  };

  return (
    <fieldset aria-describedby={describedBy} className="space-y-2">
      {label && (
        <legend className="text-sm font-medium text-slate-900 dark:text-slate-50">
          {label}
        </legend>
      )}

      <div className={cn(inline ? "flex flex-wrap gap-4" : "space-y-2")}>
        {items.map((it) => (
          <label
            key={it.value}
            className={cn(
              "inline-flex items-center gap-2",
              it.disabled && "opacity-60 cursor-not-allowed"
            )}
          >
            <Checkbox
              name={name}
              value={it.value}
              checked={values.includes(it.value)}
              onChange={() => toggle(it.value)}
              disabled={it.disabled}
              aria-invalid={!!error || undefined}
            />
            <span className="text-sm text-slate-800 dark:text-slate-200">
              {it.label}
            </span>
          </label>
        ))}
      </div>

      {helpText && (
        <Text
          id={helpId}
          className="text-xs text-slate-500 dark:text-slate-400"
        >
          {helpText}
        </Text>
      )}

      {error && (
        <Text id={errId} className="text-xs text-red-600 dark:text-red-500">
          {error}
        </Text>
      )}
    </fieldset>
  );
}
