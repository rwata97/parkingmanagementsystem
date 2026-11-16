import { InputValidationError, ResultHandler, ensureHttpError } from "express-zod-api";
import type { ErrorRequestHandler } from "express";
import { z } from "zod";

export const validationErrorSchema = z.object({
  path: z.string(),
  code: z.string(),
  message: z.string(),
});

export const problemDetailsSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string().optional(),
  instance: z.string().optional(),
  errors: z.array(validationErrorSchema).optional(),
});

export type ValidationError = z.infer<typeof validationErrorSchema>;
export type ProblemDetails = z.infer<typeof problemDetailsSchema>;

const statusTitles: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  422: "Unprocessable Content",
  429: "Too Many Requests",
  500: "Internal Server Error",
  503: "Service Unavailable",
};

export function toValidationErrors(error: InputValidationError): ValidationError[] {
  return error.cause.issues.map((issue) => ({
    path: issue.path.map(String).join("."),
    code: "validation_failed",
    message: issue.message,
  }));
}

export function createProblemDetails(
  status: number,
  detail?: string,
  instance?: string,
  errors?: ValidationError[],
): ProblemDetails {
  return {
    type: status === 400 && errors?.length
      ? "urn:parking-management:problem:validation-failed"
      : `urn:parking-management:problem:http-${status}`,
    title: statusTitles[status] ?? "Request Failed",
    status,
    ...(status < 500 && detail ? { detail } : {}),
    ...(instance ? { instance } : {}),
    ...(errors?.length ? { errors } : {}),
  };
}

export const problemDetailsResultHandler = new ResultHandler({
  positive: (outputSchema) => outputSchema,
  negative: problemDetailsSchema,
  handler: ({ output, error, response, request }) => {
    if (error) {
      const status = ensureHttpError(error).statusCode;
      const detail = status >= 500 ? undefined : error.message;
      const errors = error instanceof InputValidationError ? toValidationErrors(error) : undefined;
      response
        .status(status)
        .type("application/problem+json")
        .json(createProblemDetails(status, detail, request.path, errors));
      return;
    }
    if (
      typeof output === "object" &&
      output !== null &&
      "database" in output &&
      output.database === "unavailable"
    ) {
      response.status(503);
    }
    response.json(output);
  },
});

export const applicationErrorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  const status = ensureHttpError(error).statusCode;
  const parseFailure =
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    typeof error.type === "string" &&
    error.type.startsWith("entity.");
  const detail = status >= 500
    ? undefined
    : parseFailure
      ? "The request body could not be parsed."
      : error instanceof Error
        ? error.message
        : undefined;
  const errors = error instanceof InputValidationError ? toValidationErrors(error) : undefined;
  response
    .status(status)
    .type("application/problem+json")
    .json(createProblemDetails(status, detail, request.path, errors));
};
