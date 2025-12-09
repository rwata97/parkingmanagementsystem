import { Input } from "@/components/atoms";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
}: Props) {
  return (
    <div className="relative w-full max-w-sm">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
        🔎
      </span>
      <Input
        className="pl-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
      />
    </div>
  );
}
