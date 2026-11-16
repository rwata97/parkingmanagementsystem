import type { NextFunction, Request, Response } from "express";
import { createProblemDetails } from "./problem-details.js";

/**
 * Better Auth writes through Express's response stream. Normalize JSON error
 * responses at that boundary while leaving successful auth responses intact.
 */
export function normalizeAuthErrors(_request: Request, response: Response, next: NextFunction): void {
  const originalEnd = response.end.bind(response);
  response.end = ((...args: Parameters<Response["end"]>) => {
    let [chunk] = args;
    const contentType = response.getHeader("content-type");
    const isJson = typeof contentType === "string" && contentType.includes("application/json");

    if (response.statusCode >= 400 && isJson && (typeof chunk === "string" || Buffer.isBuffer(chunk))) {
      try {
        const source = Buffer.isBuffer(chunk) ? chunk.toString("utf8") : chunk;
        const parsed: unknown = JSON.parse(source);
        const authMessage =
          typeof parsed === "object" && parsed !== null && "message" in parsed && typeof parsed.message === "string"
            ? parsed.message
            : undefined;
        const status = response.statusCode;
        const detail = status >= 500 ? undefined : authMessage;
        const output = JSON.stringify(createProblemDetails(status, detail));
        response.setHeader("content-type", "application/problem+json; charset=utf-8");
        response.removeHeader("content-length");
        args[0] = output;
      } catch {
        // Preserve non-JSON errors from Better Auth as-is.
      }
    }

    return originalEnd(...args);
  }) as Response["end"];
  next();
}
