import { useState } from "react";
import { Badge, Button, Text } from "@/components/atoms";
import { Fieldset } from "@/components/molecules";
import { RunRaffleDialog } from "./RunRaffleDialog";

type Props = {
  lastRunAt?: string; // ISO
  nextRunAt?: string;
  registeredCount: number;
  totalResidents: number;
  onRunRaffle: () => Promise<void>; // trigger
};

export function RafflePanel({
  lastRunAt,
  nextRunAt,
  registeredCount,
  totalResidents,
  onRunRaffle,
}: Props) {
  const [open, setOpen] = useState(false);
  const coverage = Math.round(
    (registeredCount / Math.max(1, totalResidents)) * 100
  );

  return (
    <Fieldset legend="Raffle">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Metric
          label="Last run"
          value={lastRunAt ? new Date(lastRunAt).toLocaleString() : "—"}
        />
        <Metric
          label="Next run"
          value={nextRunAt ? new Date(nextRunAt).toLocaleDateString() : "—"}
        />
        <Metric
          label="Registered"
          value={`${registeredCount}/${totalResidents}`}
        />
        <Metric
          label="Coverage"
          value={
            <Badge tone={coverage >= 80 ? "success" : "warning"}>
              {coverage}%
            </Badge>
          }
        />
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={() => setOpen(true)}>Run Raffle</Button>
      </div>

      <RunRaffleDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={async () => {
          await onRunRaffle();
          setOpen(false);
        }}
      />
    </Fieldset>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <Text className="text-xs text-gray-500">{label}</Text>
      <div className="mt-1 text-base font-semibold text-gray-900">{value}</div>
    </div>
  );
}
