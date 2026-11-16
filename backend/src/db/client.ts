import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { getConfig } from "../config.js";
import { schema } from "../models/schema.js";

const config = getConfig();

export const sqlClient = postgres(config.DATABASE_URL, {
  max: config.NODE_ENV === "test" ? 2 : 10,
  connect_timeout: 5,
});

export const db = drizzle(sqlClient, { schema });
