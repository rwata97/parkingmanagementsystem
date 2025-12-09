import { useMemo } from "react";
import {
  AppShell,
  DataTable,
  ParkingGrid,
  RafflePanel,
} from "@/components/organisms";

import { useResidents } from "@/hooks/useResidents";
import { useSpots } from "@/hooks/useSpots";
import { useCurrentRaffle } from "@/hooks/useCurrentRaffle";
import { useRafflesList } from "@/hooks/useRafflesList";
import { useRunRaffle } from "@/hooks/useRunRaffle";

type ResidentRow = { name: string; email: string; vehicle: string };
type SpotRow = {
  id: string;
  status: "available" | "assigned" | "reserved" | "maintenance";
  residentName?: string;
};

export default function AdminPage() {
  const residentsQ = useResidents();
  const spotsQ = useSpots();
  const currentRaffleQ = useCurrentRaffle();
  const rafflesQ = useRafflesList();
  const { runRaffle, isRunning } = useRunRaffle();

  const loading =
    residentsQ.isLoading ||
    spotsQ.isLoading ||
    currentRaffleQ.isLoading ||
    rafflesQ.isLoading;

  // map residents into table rows
  const residentRows: ResidentRow[] =
    residentsQ.data?.map((r) => ({
      name: r.name,
      email: r.email,
      vehicle: r.vehicle?.type ?? "—",
    })) ?? [];

  // just cast the spots – they already match your ParkingGrid shape
  const spots: SpotRow[] = (spotsQ.data as SpotRow[]) ?? [];

  const registeredCount = currentRaffleQ.data?.count ?? 0;

  const lastRunAt = useMemo(() => {
    const history = rafflesQ.data ?? [];
    if (!history.length) return undefined;
    const mostRecent = [...history].sort(
      (a, b) => new Date(b.ranAt).getTime() - new Date(a.ranAt).getTime()
    )[0];
    return mostRecent.ranAt;
  }, [rafflesQ.data]);

  const nextRunAt: string | undefined = undefined; // still optional

  const handleRunRaffle = () => {
    const cycle = currentRaffleQ.data?.cycle;
    if (!cycle) return;
    runRaffle("2025-Q1");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-2xl border bg-white p-5">
          <RafflePanel
            lastRunAt={lastRunAt}
            nextRunAt={nextRunAt}
            registeredCount={registeredCount}
            totalResidents={residentRows.length}
            onRunRaffle={handleRunRaffle}
            isRunning={isRunning}
          />
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <DataTable<ResidentRow>
            title={loading ? "Residents (loading…)" : "Residents"}
            rows={residentRows}
            columns={[
              { key: "name", header: "Name", sortable: true },
              { key: "email", header: "Email", sortable: true },
              { key: "vehicle", header: "Vehicle", sortable: true },
            ]}
            searchableKeys={["name", "email", "vehicle"]}
            onRowClick={(r) => console.log("open resident", r)}
          />
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            Parking {loading ? "(loading…)" : ""}
          </h3>
          <ParkingGrid
            spots={spots as any}
            onSelect={(s) => console.log("clicked spot", s)}
          />
        </section>
      </div>
    </AppShell>
  );
}
