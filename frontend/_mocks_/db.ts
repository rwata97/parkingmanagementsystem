// src/mocks/db.ts
// Tiny in-memory DB with localStorage persistence for DEV

export type Role = "ADMIN" | "RESIDENT";
export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  password: string;
  vehicle?: Record<string, string>;
};
export type Vehicle = {
  id: string;
  residentId: string;
  type: "car" | "motorcycle";
  plate: string;
};
export type SpotStatus = "available" | "assigned" | "reserved" | "maintenance";
export type Spot = { id: string; status: SpotStatus; residentId?: string };
export type Raffle = {
  id: string;
  cycle: string;
  ranAt: string;
  winners: Array<{ spotId: string; residentId: string }>;
};
export type Registration = {
  cycle: string;
  residentId: string;
  registeredAt: string;
};
export type Assignment = {
  cycle: string;
  spotId: string;
  residentId: string;
  assignedAt: string;
};

type DB = {
  users: User[];
  spots: Spot[];
  raffles: Raffle[];
  registrations: Registration[];
  assignments: Assignment[];
};

const LS_KEY = "mock_db_v1";

// seed
const defaultDB: DB = {
  users: [
    {
      id: "u1",
      name: "Admin",
      email: "admin@demo.test",
      password: "admin123",
      role: "ADMIN",
    },

    // ===== 20 RESIDENTS =====
    {
      id: "u2",
      name: "Resident One",
      email: "res1@demo.test",
      password: "pass1234",
      role: "RESIDENT",
      vehicle: { id: "v1", residentId: "u2", type: "car", plate: "ABC-101" },
    },
    {
      id: "u3",
      name: "Maria Gomez",
      email: "maria.gomez@test.com",
      password: "pass1234",
      role: "RESIDENT",
      vehicle: { id: "v2", residentId: "u3", type: "car", plate: "XYZ-202" },
    },
    {
      id: "u4",
      name: "James Brown",
      email: "james.brown@test.com",
      password: "pass1234",
      role: "RESIDENT",
      vehicle: { id: "v3", residentId: "u4", type: "car", plate: "LMN-303" },
    },
    {
      id: "u5",
      name: "Sofia Martínez",
      email: "sofia.m@test.com",
      password: "pass1234",
      role: "RESIDENT",
      vehicle: { id: "v4", residentId: "u5", type: "car", plate: "HJK-404" },
    },
    {
      id: "u6",
      name: "David Lee",
      email: "david.lee@test.com",
      password: "pass1234",
      role: "RESIDENT",
      vehicle: {
        id: "v5",
        residentId: "u6",
        type: "motorcycle",
        plate: "MOTO-11",
      },
    },
    {
      id: "u7",
      name: "Aisha Khan",
      email: "aisha.k@test.com",
      password: "pass1234",
      role: "RESIDENT",
      vehicle: { id: "v6", residentId: "u7", type: "car", plate: "PRQ-505" },
    },
    {
      id: "u8",
      name: "Xavier Torres",
      email: "x.torres@test.com",
      password: "pass1234",
      role: "RESIDENT",
      vehicle: { id: "v7", residentId: "u8", type: "car", plate: "TUV-606" },
    },
    {
      id: "u9",
      name: "Chloe Smith",
      email: "chloe.smith@test.com",
      password: "pass1234",
      role: "RESIDENT",
      vehicle: {
        id: "v8",
        residentId: "u9",
        type: "motorcycle",
        plate: "MOTO-22",
      },
    },
    {
      id: "u10",
      name: "Carlos Ruiz",
      email: "carlos.ruiz@test.com",
      password: "pass1234",
      role: "RESIDENT",
      vehicle: { id: "v9", residentId: "u10", type: "car", plate: "CDE-707" },
    },
    {
      id: "u11",
      name: "Emily Davis",
      email: "emily.davis@test.com",
      password: "pass1234",
      role: "RESIDENT",
      vehicle: { id: "v10", residentId: "u11", type: "car", plate: "QWE-808" },
    },
    {
      id: "u12",
      name: "Ricardo Molina",
      email: "r.molina@test.com",
      password: "pass1234",
      role: "RESIDENT",
      vehicle: { id: "v11", residentId: "u12", type: "car", plate: "RTY-909" },
    },
    {
      id: "u13",
      name: "Hannah Clarke",
      email: "h.clarke@test.com",
      password: "pass1234",
      role: "RESIDENT",
      vehicle: { id: "v12", residentId: "u13", type: "car", plate: "IOP-010" },
    },
    {
      id: "u14",
      name: "Mohamed Ali",
      email: "m.ali@test.com",
      password: "pass1234",
      role: "RESIDENT",
      vehicle: {
        id: "v13",
        residentId: "u14",
        type: "motorcycle",
        plate: "MOTO-33",
      },
    },
    {
      id: "u15",
      name: "Laura Ramos",
      email: "laura.ramos@test.com",
      password: "pass1234",
      role: "RESIDENT",
      vehicle: { id: "v14", residentId: "u15", type: "car", plate: "PLK-111" },
    },
    {
      id: "u16",
      name: "Ethan Walker",
      email: "ethan.walker@test.com",
      password: "pass1234",
      role: "RESIDENT",
      vehicle: { id: "v15", residentId: "u16", type: "car", plate: "GHJ-222" },
    },
    {
      id: "u17",
      name: "Daniela Ortiz",
      email: "daniela.ortiz@test.com",
      password: "pass1234",
      role: "RESIDENT",
      vehicle: { id: "v16", residentId: "u17", type: "car", plate: "ZXC-333" },
    },
    {
      id: "u18",
      name: "William Parker",
      email: "will.parker@test.com",
      password: "pass1234",
      role: "RESIDENT",
      vehicle: { id: "v17", residentId: "u18", type: "car", plate: "VBN-444" },
    },
    {
      id: "u19",
      name: "Camila Rivera",
      email: "camila.rivera@test.com",
      password: "pass1234",
      role: "RESIDENT",
      vehicle: { id: "v18", residentId: "u19", type: "car", plate: "NMJ-555" },
    },
    {
      id: "u20",
      name: "Oliver Green",
      email: "oliver.green@test.com",
      password: "pass1234",
      role: "RESIDENT",
      vehicle: { id: "v19", residentId: "u20", type: "car", plate: "BGT-666" },
    },
    {
      id: "u21",
      name: "Isabella Flores",
      email: "isabella.flores@test.com",
      password: "pass1234",
      role: "RESIDENT",
      vehicle: { id: "v20", residentId: "u21", type: "car", plate: "WER-777" },
    },
  ],

  // ===== SPOTS: A1..D4 =====
  spots: [
    ...["A", "B", "C", "D"].flatMap((r) =>
      [1, 2, 3, 4].map((n) => ({
        id: `${r}${n}`,
        status: "available" as SpotStatus,
      }))
    ),
  ],

  // ===== EMPTY RAFFLES (WILL GENERATE THESE BY RUNNING) =====
  raffles: [],

  // ===== REGISTRATIONS FOR FIRST CYCLE (Q4) =====
  registrations: [
    {
      cycle: "2024-Q4",
      residentId: "u2",
      registeredAt: "2024-12-01T10:00:00Z",
    },
    {
      cycle: "2024-Q4",
      residentId: "u3",
      registeredAt: "2024-12-01T10:01:00Z",
    },
    {
      cycle: "2024-Q4",
      residentId: "u4",
      registeredAt: "2024-12-01T10:02:00Z",
    },
    {
      cycle: "2024-Q4",
      residentId: "u5",
      registeredAt: "2024-12-01T10:03:00Z",
    },
    {
      cycle: "2024-Q4",
      residentId: "u6",
      registeredAt: "2024-12-01T10:04:00Z",
    },
    {
      cycle: "2024-Q4",
      residentId: "u7",
      registeredAt: "2024-12-01T10:05:00Z",
    },
    {
      cycle: "2024-Q4",
      residentId: "u8",
      registeredAt: "2024-12-01T10:06:00Z",
    },
    {
      cycle: "2024-Q4",
      residentId: "u9",
      registeredAt: "2024-12-01T10:07:00Z",
    },
    {
      cycle: "2024-Q4",
      residentId: "u10",
      registeredAt: "2024-12-01T10:08:00Z",
    },
    {
      cycle: "2024-Q4",
      residentId: "u11",
      registeredAt: "2024-12-01T10:09:00Z",
    },
    {
      cycle: "2024-Q4",
      residentId: "u12",
      registeredAt: "2024-12-01T10:10:00Z",
    },
    {
      cycle: "2024-Q4",
      residentId: "u13",
      registeredAt: "2024-12-01T10:11:00Z",
    },
    {
      cycle: "2024-Q4",
      residentId: "u14",
      registeredAt: "2024-12-01T10:12:00Z",
    },
    {
      cycle: "2024-Q4",
      residentId: "u15",
      registeredAt: "2024-12-01T10:13:00Z",
    },
    {
      cycle: "2024-Q4",
      residentId: "u16",
      registeredAt: "2024-12-01T10:14:00Z",
    },
    {
      cycle: "2024-Q4",
      residentId: "u17",
      registeredAt: "2024-12-01T10:15:00Z",
    },
    {
      cycle: "2024-Q4",
      residentId: "u18",
      registeredAt: "2024-12-01T10:16:00Z",
    },
    {
      cycle: "2024-Q4",
      residentId: "u19",
      registeredAt: "2024-12-01T10:17:00Z",
    },
    {
      cycle: "2024-Q4",
      residentId: "u20",
      registeredAt: "2024-12-01T10:18:00Z",
    },
    {
      cycle: "2024-Q4",
      residentId: "u21",
      registeredAt: "2024-12-01T10:19:00Z",
    },
    // ===== NEXT CYCLE: 2025-Q1 =====
    {
      cycle: "2025-Q1",
      residentId: "u2",
      registeredAt: "2025-01-01T10:00:00Z",
    },
    {
      cycle: "2025-Q1",
      residentId: "u3",
      registeredAt: "2025-01-01T10:01:00Z",
    },
    {
      cycle: "2025-Q1",
      residentId: "u4",
      registeredAt: "2025-01-01T10:02:00Z",
    },
    {
      cycle: "2025-Q1",
      residentId: "u5",
      registeredAt: "2025-01-01T10:03:00Z",
    },
    {
      cycle: "2025-Q1",
      residentId: "u6",
      registeredAt: "2025-01-01T10:04:00Z",
    },
    {
      cycle: "2025-Q1",
      residentId: "u7",
      registeredAt: "2025-01-01T10:05:00Z",
    },
    {
      cycle: "2025-Q1",
      residentId: "u8",
      registeredAt: "2025-01-01T10:06:00Z",
    },
    {
      cycle: "2025-Q1",
      residentId: "u9",
      registeredAt: "2025-01-01T10:07:00Z",
    },
    {
      cycle: "2025-Q1",
      residentId: "u10",
      registeredAt: "2025-01-01T10:08:00Z",
    },
    {
      cycle: "2025-Q1",
      residentId: "u11",
      registeredAt: "2025-01-01T10:09:00Z",
    },
    {
      cycle: "2025-Q1",
      residentId: "u12",
      registeredAt: "2025-01-01T10:10:00Z",
    },
    {
      cycle: "2025-Q1",
      residentId: "u13",
      registeredAt: "2025-01-01T10:11:00Z",
    },
    {
      cycle: "2025-Q1",
      residentId: "u14",
      registeredAt: "2025-01-01T10:12:00Z",
    },
    {
      cycle: "2025-Q1",
      residentId: "u15",
      registeredAt: "2025-01-01T10:13:00Z",
    },
    {
      cycle: "2025-Q1",
      residentId: "u16",
      registeredAt: "2025-01-01T10:14:00Z",
    },
    {
      cycle: "2025-Q1",
      residentId: "u17",
      registeredAt: "2025-01-01T10:15:00Z",
    },
    {
      cycle: "2025-Q1",
      residentId: "u18",
      registeredAt: "2025-01-01T10:16:00Z",
    },
    {
      cycle: "2025-Q1",
      residentId: "u19",
      registeredAt: "2025-01-01T10:17:00Z",
    },
    {
      cycle: "2025-Q1",
      residentId: "u20",
      registeredAt: "2025-01-01T10:18:00Z",
    },
    {
      cycle: "2025-Q1",
      residentId: "u21",
      registeredAt: "2025-01-01T10:19:00Z",
    },
    // ===== NEXT CYCLE: 2025-Q2 =====
    {
      cycle: "2025-Q2",
      residentId: "u2",
      registeredAt: "2025-04-01T10:00:00Z",
    },
    {
      cycle: "2025-Q2",
      residentId: "u3",
      registeredAt: "2025-04-01T10:01:00Z",
    },
    {
      cycle: "2025-Q2",
      residentId: "u4",
      registeredAt: "2025-04-01T10:02:00Z",
    },
    {
      cycle: "2025-Q2",
      residentId: "u5",
      registeredAt: "2025-04-01T10:03:00Z",
    },
    {
      cycle: "2025-Q2",
      residentId: "u6",
      registeredAt: "2025-04-01T10:04:00Z",
    },
    {
      cycle: "2025-Q2",
      residentId: "u7",
      registeredAt: "2025-04-01T10:05:00Z",
    },
    {
      cycle: "2025-Q2",
      residentId: "u8",
      registeredAt: "2025-04-01T10:06:00Z",
    },
    {
      cycle: "2025-Q2",
      residentId: "u9",
      registeredAt: "2025-04-01T10:07:00Z",
    },
    {
      cycle: "2025-Q2",
      residentId: "u10",
      registeredAt: "2025-04-01T10:08:00Z",
    },
    {
      cycle: "2025-Q2",
      residentId: "u11",
      registeredAt: "2025-04-01T10:09:00Z",
    },
    {
      cycle: "2025-Q2",
      residentId: "u12",
      registeredAt: "2025-04-01T10:10:00Z",
    },
    {
      cycle: "2025-Q2",
      residentId: "u13",
      registeredAt: "2025-04-01T10:11:00Z",
    },
    {
      cycle: "2025-Q2",
      residentId: "u14",
      registeredAt: "2025-04-01T10:12:00Z",
    },
    {
      cycle: "2025-Q2",
      residentId: "u15",
      registeredAt: "2025-04-01T10:13:00Z",
    },
    {
      cycle: "2025-Q2",
      residentId: "u16",
      registeredAt: "2025-04-01T10:14:00Z",
    },
    {
      cycle: "2025-Q2",
      residentId: "u17",
      registeredAt: "2025-04-01T10:15:00Z",
    },
    {
      cycle: "2025-Q2",
      residentId: "u18",
      registeredAt: "2025-04-01T10:16:00Z",
    },
    {
      cycle: "2025-Q2",
      residentId: "u19",
      registeredAt: "2025-04-01T10:17:00Z",
    },
    {
      cycle: "2025-Q2",
      residentId: "u20",
      registeredAt: "2025-04-01T10:18:00Z",
    },
  ],

  // ===== WILL BE POPULATED WHEN  RUNNING THE CYCLE =====
  assignments: [],
};

function load(): DB {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as DB) : structuredClone(defaultDB);
  } catch {
    return structuredClone(defaultDB);
  }
}

let db = load();

export function save() {
  localStorage.setItem(LS_KEY, JSON.stringify(db));
}

export function getDB() {
  return db;
}
export function resetDB() {
  db = structuredClone(defaultDB);
  save();
}
