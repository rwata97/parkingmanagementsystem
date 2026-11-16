import { EndpointsFactory } from "express-zod-api";
import { z } from "zod";
import type { HealthReport } from "../services/health.service.js";
import { problemDetailsResultHandler } from "../http/problem-details.js";

const healthOutput = z.object({
  status: z.enum(["ok", "degraded"]),
  database: z.enum(["ok", "unavailable"]),
  timestamp: z.string().datetime(),
});

export function createHealthController(getHealth: () => Promise<HealthReport>) {
  const factory = new EndpointsFactory(problemDetailsResultHandler);
  return factory.build({
    method: "get",
    input: z.object({}),
    output: healthOutput,
    statusCode: [200, 503],
    summary: "Check API and database readiness",
    tag: "system",
    handler: async () => getHealth(),
  });
}
