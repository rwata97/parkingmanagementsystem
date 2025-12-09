import { getDB, save, Raffle } from "./db";
import { delay, quarterCycle } from "./utils";
// src/mocks/raffle.ts (or wherever your run() lives)
import { shuffle } from "./utils";
type Winner = { spotId: string; residentId: string };

export type ResidentHistoryRow = {
  cycle: string;
  result: "Selected" | "Not selected";
  spot: string | null;
};

/**
 * GET /api/raffles/current
 * Returns the current cycle info and number of registrations.
 */
export async function current() {
  await delay(150);
  const cycle = quarterCycle();
  const db = getDB();
  const count = db.registrations.filter((r) => r.cycle === cycle).length;

  // For MVP assume registration window always open
  return { cycle, regOpen: true, regClosesAt: null, count };
}

/**
 * POST /api/raffles/register
 * Mock: register the current resident (u2) for the current cycle.
 */
export async function register({ residentId }: { residentId: string }) {
  await delay(150);
  const db = getDB();
  const cycle = quarterCycle();

  const resident = db.users.find(
    (u) => u.id === residentId && u.role === "RESIDENT"
  );
  if (!resident) throw new Error("No resident found in mock DB");

  const alreadyRegistered = db.registrations.some(
    (r) => r.cycle === cycle && r.residentId === resident.id
  );

  if (!alreadyRegistered) {
    db.registrations.push({
      cycle,
      residentId: resident.id,
      registeredAt: new Date().toISOString(),
    });
    save();
  }

  return { registered: true };
}

/**
 * GET /api/admin/raffles
 * Return all raffles (newest first)
 */
export async function list() {
  await delay(150);
  const db = getDB();
  return db.raffles.slice().reverse();
}

/**
 * GET /api/admin/raffles/:id
 * Return a single raffle by ID
 */
export async function get(raffleId: string) {
  await delay(150);
  const db = getDB();
  const rf = db.raffles.find((r) => r.id === raffleId);
  if (!rf) throw new Error("Not found");
  return rf;
}

/**
 * POST /api/admin/raffle
 * Run raffle for the given cycle.
 */

const nowISO = () => new Date().toISOString();

export function run(cycle: string): Raffle {
  const db = getDB();

  //  Block multiple raffles for the same cycle
  const existingForCycle = db.raffles.find((r) => r.cycle === cycle);
  if (existingForCycle) {
    throw new Error(`Raffle has already been run for cycle "${cycle}".`);
  }

  // 1️⃣ Get all registered residents for this cycle (unique)
  const regs = db.registrations.filter((r) => r.cycle === cycle);
  const uniqueRegs = Array.from(new Set(regs.map((r) => r.residentId)));

  // If nobody registered → just record an empty raffle and keep current spots
  if (!uniqueRegs.length) {
    const raffle: Raffle = {
      id: crypto.randomUUID(),
      cycle,
      ranAt: nowISO(),
      winners: [],
    };
    db.raffles.push(raffle);
    save();
    return raffle;
  }

  // Apply Fisher–Yates shuffle for fair randomization.
  // This algorithm avoids bias found in naive shuffle approaches (e.g., sort(() => Math.random())).
  // Ensures every resident has an equal chance in the raffle.
  // 2️⃣ New 3-month cycle: free up old assignments.
  //    We only reset spots that were "assigned" – reserved/maintenance stay as they are.
  for (const spot of db.spots) {
    if (spot.status === "assigned") {
      spot.status = "available";
      spot.residentId = undefined;
    }
  }

  // 3️⃣ Fairness: prioritize residents who did NOT win the last raffle
  const prevRaffle = db.raffles.at(-1); // last raffle overall = previous cycle
  const prevWinners = new Set(
    prevRaffle?.winners.map((w) => w.residentId) ?? []
  );

  console.log("FAIRNESSS COMPARISON:::::");
  const groupA = uniqueRegs.filter((id) => !prevWinners.has(id)); // didn't win last time
  const groupB = uniqueRegs.filter((id) => prevWinners.has(id)); // did win last time

  console.log("groupA", groupA);
  console.log("groupB", groupB);
  // Shuffle inside each group, then put A before B
  const prioritized = [...shuffle(groupA), ...shuffle(groupB)];

  // 4️⃣ Assign one spot per resident, up to number of available spots
  const availableSpots = db.spots.filter((s) => s.status === "available");
  const shuffledSpots = shuffle(availableSpots);
  const n = Math.min(prioritized.length, shuffledSpots.length);

  const winners: Winner[] = [];

  for (let i = 0; i < n; i++) {
    const spot = shuffledSpots[i];
    const residentId = prioritized[i];

    winners.push({ spotId: spot.id, residentId });

    spot.status = "assigned";
    spot.residentId = residentId;

    // Track assignment history for this cycle
    db.assignments.push({
      cycle,
      spotId: spot.id,
      residentId,
      assignedAt: nowISO(),
    });
  }

  console.log("WINNERS", winners);
  const raffle: Raffle = {
    id: crypto.randomUUID(),
    cycle,
    ranAt: nowISO(),
    winners,
  };

  db.raffles.push(raffle);
  save();

  return raffle;
}

/**
 * Build raffle history for a given resident:
 * - Look at all cycles they registered for
 * - Mark "Selected" if they have an assignment in that cycle, otherwise "Not selected"
 */
export async function historyByResident(
  residentId: string
): Promise<ResidentHistoryRow[]> {
  await delay(150);
  const db = getDB();

  // all cycles this resident registered for
  const regCycles = db.registrations
    .filter((r) => r.residentId === residentId)
    .map((r) => r.cycle);
  const uniqueCycles = Array.from(new Set(regCycles));

  const rows: ResidentHistoryRow[] = uniqueCycles.map((cycle) => {
    const win = db.assignments.find(
      (a) => a.cycle === cycle && a.residentId === residentId
    );
    return {
      cycle,
      result: win ? "Selected" : "Not selected",
      spot: win ? win.spotId : null,
    };
  });

  // you can sort cycles if you like
  rows.sort((a, b) => a.cycle.localeCompare(b.cycle));

  return rows;
}
