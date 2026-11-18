import { sqlClient } from "../db/client.js";

/** Database access for the health use case. */
export async function checkDatabase(): Promise<void> {
  await sqlClient`select 1`;
}
