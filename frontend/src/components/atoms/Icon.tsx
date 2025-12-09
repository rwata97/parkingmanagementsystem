export function Icon({
  children,
  label,
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <span role={label ? "img" : undefined} aria-label={label}>
      {children}
    </span>
  );
}
