// src/mocks/auth.ts
import { delay } from "./utils";
import { getDB, save } from "./db";

type Role = "ADMIN" | "RESIDENT";

function normalizeEmail(s: string) {
  return s.trim().toLowerCase();
}

export async function login(email: string, password: string) {
  await delay(300);
  const { users } = getDB();
  const e = normalizeEmail(email);
  const user = users.find(
    (u) => normalizeEmail(u.email) === e && u.password === password
  );
  if (!user) throw new Error("Invalid email or password");
  const token = btoa(`${user.id}:${Date.now()}`); // mock token (dev only)
  return { token, role: user.role as Role, userId: user.id, name: user.name };
}

export async function register(
  name: string,
  email: string,
  password: string,
  vehicle: Record<string, string> = {}
) {
  await delay(300);
  const db = getDB();
  const e = normalizeEmail(email);
  if (db.users.some((u) => normalizeEmail(u.email) === e)) {
    throw new Error("Email already in use");
  }

  // minimal validation to catch typos in dev
  if (!name.trim()) throw new Error("Name is required");
  if (password.length < 6)
    throw new Error("Password must be at least 6 characters");

  const newUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: e,
    password, // plain for mock; do NOT do this in prod
    role: "RESIDENT" as const,
    vehicle, // e.g. { type: 'car', plate: 'ABC123' }
  };

  db.users.push(newUser);
  save();

  const token = btoa(`${newUser.id}:${Date.now()}`);
  return {
    token,
    role: newUser.role,
    userId: newUser.id,
    name: newUser.name,
    vehicle: newUser.vehicle,
  };
}

export async function me(token: string) {
  await delay(200);
  if (!token) throw new Error("Unauthorized");
  const [uid] = atob(token).split(":");
  const db = getDB();
  const user = db.users.find((u) => u.id === uid);
  if (!user) throw new Error("Unauthorized");
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
  };
}

export async function logout(_token?: string) {
  await delay(150);
  return { ok: true };
}

export async function requestPasswordReset(_email: string) {
  await delay(200);
  // in a real API you'd issue a token via email; we just no-op
  return { ok: true };
}

export async function resetPassword(_token: string, _newPassword: string) {
  await delay(200);
  // in a real API you'd verify token & update hash; we just no-op
  return { ok: true };
}
