// src/mocks/residents.ts
import { delay } from "./utils";
import { getDB } from "./db";

export async function list(q = "") {
  await delay(150);
  const { users } = getDB();
  const rows = users.filter((u) => u.role === "RESIDENT");
  if (!q)
    return rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      vehicle: u.vehicle ?? "—",
    }));
  const n = q.toLowerCase();
  return rows
    .filter(
      (u) =>
        u.name.toLowerCase().includes(n) || u.email.toLowerCase().includes(n)
    )
    .map((u) => ({ id: u.id, name: u.name, email: u.email, vehicle: "—" }));
}
