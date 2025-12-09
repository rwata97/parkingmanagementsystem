import { AppShell } from "@/components/organisms";
import { Badge, Button, Heading, Text } from "@/components/atoms";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/molecules";
import { useAuth } from "@/components/auth/AuthProvider";
import { useResidentRaffleHistory } from "@/hooks/useResidentRaffleHistory";
import { useRegisterForRaffle } from "@/hooks/useRegisterForRaffle";
import { useSpots } from "@/hooks/useSpots";
import { useCurrentRaffle } from "@/hooks/useCurrentRaffle";

export default function ResidentPage() {
  const { user } = useAuth();

  const currentQ = useCurrentRaffle();
  const spotsQ = useSpots();
  const historyQ = useResidentRaffleHistory(!!user);

  const registerMut = useRegisterForRaffle(user?.id);

  const loading = currentQ.isLoading || spotsQ.isLoading || historyQ.isLoading;
  const cycle = currentQ.data?.cycle ?? "";
  const regOpen = !!currentQ.data?.regOpen;

  const currentSpot =
    spotsQ.data?.find((s) => s.residentId === user?.id)?.id ?? null;

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="rounded-2xl border bg-white p-5">
          <Heading level={2}>Welcome{user ? `, ${user.name}` : ""}</Heading>
          <Text className="mt-1">
            Manage your raffle registration and view your parking history.
          </Text>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-white p-5">
            <Heading level={3}>Raffle</Heading>
            <Text className="mt-1 text-gray-600">
              {loading ? "Loading raffle…" : `Current cycle: ${cycle || "—"}`}
            </Text>
            <div className="mt-3 flex items-center gap-3">
              {regOpen ? (
                <Button
                  onClick={() => registerMut.mutate()}
                  disabled={registerMut.isPending || loading}
                  isLoading={registerMut.isPending}
                >
                  Register for Raffle
                </Button>
              ) : (
                <Badge tone="neutral">Registration Closed</Badge>
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <Heading level={3}>Current Spot</Heading>
            <Text className="mt-1 text-gray-600">
              {loading
                ? "Checking…"
                : currentSpot
                ? currentSpot
                : "No spot assigned."}
            </Text>
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <Heading level={3}>History</Heading>
          <div className="mt-3 overflow-auto">
            <Table>
              <Thead>
                <Tr>
                  <Th>Cycle</Th>
                  <Th>Result</Th>
                  <Th>Spot</Th>
                </Tr>
              </Thead>
              <Tbody>
                {historyQ.isLoading ? (
                  <Tr>
                    <Td colSpan={3}>Loading…</Td>
                  </Tr>
                ) : historyQ.history.length === 0 ? (
                  <Tr>
                    <Td colSpan={3}>No history yet.</Td>
                  </Tr>
                ) : (
                  historyQ.history.map((r, i) => (
                    <Tr key={`${r.cycle}-${r.spot}-${i}`}>
                      <Td>{r.cycle}</Td>
                      <Td>{r.result}</Td>
                      <Td>{r.spot ?? "—"}</Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
