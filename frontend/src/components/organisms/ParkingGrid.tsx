import { Badge } from "@/components/atoms";
import { cn } from "@/lib/cn";

export type SpotStatus = "available" | "assigned" | "reserved" | "maintenance";
export type Spot = {
  id: string;
  status: SpotStatus;
  residentName?: string;
};

type Props = {
  spots: Spot[];
  onSelect?: (spot: Spot) => void;
};

const statusStyles: Record<SpotStatus, string> = {
  available: "bg-emerald-50 border-emerald-300",
  assigned: "bg-blue-50 border-blue-300",
  reserved: "bg-amber-50 border-amber-300",
  maintenance: "bg-red-50 border-red-300",
};

export function ParkingGrid({ spots, onSelect }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Legend color="bg-emerald-200" label="Available" />
        <Legend color="bg-blue-200" label="Assigned" />
        <Legend color="bg-amber-200" label="Reserved" />
        <Legend color="bg-red-200" label="Maintenance" />
      </div>

      <div className="grid grid-cols-4 gap-3">
        {spots.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect?.(s)}
            className={cn(
              "flex h-24 flex-col items-center justify-center rounded-xl border text-sm transition hover:shadow text-gray-600",
              statusStyles[s.status]
            )}
          >
            <div className="font-semibold">{s.id}</div>
            <div className="mt-1">
              {s.status === "assigned" && s.residentName ? (
                <Badge tone="info">{s.residentName}</Badge>
              ) : (
                <Badge
                  tone={
                    s.status === "available"
                      ? "success"
                      : s.status === "reserved"
                      ? "warning"
                      : "danger"
                  }
                >
                  {s.status}
                </Badge>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-gray-700">
      <span className={cn("h-3 w-3 rounded", color)} />
      {label}
    </span>
  );
}
