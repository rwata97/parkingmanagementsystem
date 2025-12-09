import { cn } from "@/lib/cn";

type Props = {
  legend: string;
  children: React.ReactNode;
  className?: string;
  description?: string;
};

export function Fieldset({ legend, children, description, className }: Props) {
  return (
    <fieldset className={cn("rounded-xl border p-4", className)}>
      <legend className="px-1 text-sm font-medium text-gray-800">
        {legend}
      </legend>
      {description ? (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      ) : null}
      <div className="mt-3 space-y-3">{children}</div>
    </fieldset>
  );
}
