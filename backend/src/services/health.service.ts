export type HealthReport = {
  status: "ok" | "degraded";
  database: "ok" | "unavailable";
  timestamp: string;
};

export type DatabaseCheck = () => Promise<void>;

/** Implements the health readiness use case without owning HTTP or SQL details. */
export function createHealthService(checkDatabase: DatabaseCheck) {
  return async function getHealth(): Promise<HealthReport> {
    let database: HealthReport["database"] = "ok";
    try {
      await checkDatabase();
    } catch {
      database = "unavailable";
    }

    return {
      status: database === "ok" ? "ok" : "degraded",
      database,
      timestamp: new Date().toISOString(),
    };
  };
}
