import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

const instant = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

export const userRole = pgEnum("user_role", ["ADMIN", "RESIDENT"]);
export const spotStatus = pgEnum("spot_status", ["available", "assigned", "reserved", "maintenance"]);
export const cycleState = pgEnum("cycle_state", [
  "scheduled",
  "registration_open",
  "registration_closed",
  "completed",
  "expired",
]);
export const cycleActionType = pgEnum("cycle_action_type", ["start", "close", "reopen", "run", "expire"]);
export const raffleOutcomeStatus = pgEnum("raffle_outcome_status", ["selected", "not_selected"]);

// Better Auth's core schema and application-owned identity fields share one user table.
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: userRole("role").notNull().default("RESIDENT"),
  deletedAt: instant("deleted_at"),
  createdAt: instant("created_at").notNull().defaultNow(),
  updatedAt: instant("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: instant("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: instant("created_at").notNull().defaultNow(),
  updatedAt: instant("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
}, (table) => [index("session_user_id_idx").on(table.userId)]);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: instant("access_token_expires_at"),
  refreshTokenExpiresAt: instant("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: instant("created_at").notNull().defaultNow(),
  updatedAt: instant("updated_at").notNull().defaultNow(),
}, (table) => [index("account_user_id_idx").on(table.userId)]);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: instant("expires_at").notNull(),
  createdAt: instant("created_at").defaultNow(),
  updatedAt: instant("updated_at").defaultNow(),
}, (table) => [index("verification_identifier_idx").on(table.identifier)]);

export const vehicle = pgTable("vehicle", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique().references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  plate: text("plate").notNull(),
  createdAt: instant("created_at").notNull().defaultNow(),
});

export const spot = pgTable("spot", {
  id: text("id").primaryKey(),
  status: spotStatus("status").notNull().default("available"),
  currentResidentId: text("current_resident_id").references(() => user.id, { onDelete: "set null" }),
  updatedAt: instant("updated_at").notNull().defaultNow(),
});

export const raffleCycle = pgTable("raffle_cycle", {
  id: uuid("id").defaultRandom().primaryKey(),
  targetQuarter: text("target_quarter").notNull().unique(),
  registrationClosesAt: instant("registration_closes_at").notNull(),
  state: cycleState("state").notNull().default("scheduled"),
  createdAt: instant("created_at").notNull().defaultNow(),
  updatedAt: instant("updated_at").notNull().defaultNow(),
});

export const cycleAction = pgTable("cycle_action", {
  id: uuid("id").defaultRandom().primaryKey(),
  cycleId: uuid("cycle_id").notNull().references(() => raffleCycle.id, { onDelete: "restrict" }),
  actorId: text("actor_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  action: cycleActionType("action").notNull(),
  reason: text("reason"),
  occurredAt: instant("occurred_at").notNull().defaultNow(),
}, (table) => [index("cycle_action_cycle_time_idx").on(table.cycleId, table.occurredAt)]);

export const registration = pgTable("registration", {
  id: uuid("id").defaultRandom().primaryKey(),
  cycleId: uuid("cycle_id").notNull().references(() => raffleCycle.id, { onDelete: "restrict" }),
  residentId: text("resident_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  createdAt: instant("created_at").notNull().defaultNow(),
}, (table) => [
  unique("registration_cycle_resident_unique").on(table.cycleId, table.residentId),
  index("registration_cycle_idx").on(table.cycleId),
]);

export const raffleResult = pgTable("raffle_result", {
  id: uuid("id").defaultRandom().primaryKey(),
  cycleId: uuid("cycle_id").notNull().unique().references(() => raffleCycle.id, { onDelete: "restrict" }),
  actorId: text("actor_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  ranAt: instant("ran_at").notNull().defaultNow(),
});

export const raffleOutcome = pgTable("raffle_outcome", {
  id: uuid("id").defaultRandom().primaryKey(),
  resultId: uuid("result_id").notNull().references(() => raffleResult.id, { onDelete: "restrict" }),
  residentId: text("resident_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  status: raffleOutcomeStatus("status").notNull(),
  spotId: text("spot_id").references(() => spot.id, { onDelete: "restrict" }),
}, (table) => [
  unique("raffle_outcome_result_resident_unique").on(table.resultId, table.residentId),
  unique("raffle_outcome_result_spot_unique").on(table.resultId, table.spotId),
]);

export const assignment = pgTable("assignment", {
  id: uuid("id").defaultRandom().primaryKey(),
  cycleId: uuid("cycle_id").notNull().references(() => raffleCycle.id, { onDelete: "restrict" }),
  resultId: uuid("result_id").notNull().references(() => raffleResult.id, { onDelete: "restrict" }),
  residentId: text("resident_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  spotId: text("spot_id").notNull().references(() => spot.id, { onDelete: "restrict" }),
  assignedAt: instant("assigned_at").notNull().defaultNow(),
}, (table) => [
  unique("assignment_cycle_resident_unique").on(table.cycleId, table.residentId),
  unique("assignment_cycle_spot_unique").on(table.cycleId, table.spotId),
  unique("assignment_result_resident_unique").on(table.resultId, table.residentId),
  index("assignment_resident_idx").on(table.residentId),
]);

export const authSchema = { user, session, account, verification };

// Keep this explicit so migrations and Better Auth use the same Drizzle-owned tables.
export const schema = {
  user,
  session,
  account,
  verification,
  vehicle,
  spot,
  raffleCycle,
  cycleAction,
  registration,
  raffleResult,
  raffleOutcome,
  assignment,
};
