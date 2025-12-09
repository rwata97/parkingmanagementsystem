// src/mocks/spots.ts
import { delay } from "./utils";
import { getDB, save } from "./db";

export async function list(params?: { status?: string }) {
  await delay(200);
  const { spots, users } = getDB();
  const filtered = params?.status
    ? spots.filter((s) => s.status === params.status)
    : spots;
  // enrich with residentName for convenience
  return filtered.map((s) => ({
    ...s,
    residentName: s.residentId
      ? users.find((u) => u.id === s.residentId)?.name
      : undefined,
  }));
}

export async function update(
  id: string,
  body: Partial<{ status: string; residentId?: string }>
) {
  await delay(200);
  const db = getDB();
  const spot = db.spots.find((s) => s.id === id);
  if (!spot) throw new Error("Spot not found");
  Object.assign(spot, body);
  save();
  return spot;
}
