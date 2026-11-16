import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { getConfig } from "./config.js";
import { db } from "./db/client.js";
import { authSchema } from "./models/schema.js";

const config = getConfig();

export const auth = betterAuth({
  appName: "Community Parking Management System",
  baseURL: config.BETTER_AUTH_URL,
  basePath: "/api/v1/auth",
  secret: config.BETTER_AUTH_SECRET,
  trustedOrigins: [config.FRONTEND_ORIGIN],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "RESIDENT",
        input: false,
      },
      deletedAt: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },
  advanced: {
    useSecureCookies: config.NODE_ENV === "production",
  },
  onAPIError: {
    onError: (error) => {
      // Do not log request bodies or credentials; this is the only auth error hook
      // exposed by Better Auth and is useful for a future structured logger.
      if (config.NODE_ENV !== "test") {
        console.error("Better Auth request failed", error instanceof Error ? error.message : "Unknown error");
      }
    },
  },
});
