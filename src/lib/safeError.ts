/**
 * Safe Error Normalizer
 * NEVER exposes raw database, Prisma, SQL, JSON parse errors, internal error codes,
 * or stack traces to the user.
 * Always normalizes to clean, professional, human-readable copy.
 */

export interface SafeErrorResult {
  safeMessage: string;
  requestId: string;
}

// Technical keywords and patterns that must NEVER be shown in the UI
const TECHNICAL_TERMS = [
  "token",
  "doctype",
  "json",
  "syntax",
  "typeerror",
  "referenceerror",
  "rangeerror",
  "evalerror",
  "networkerror",
  "fetch",
  "prisma",
  "sql",
  "database",
  "column",
  "select",
  "insert",
  "update",
  "delete",
  "table",
  "relation",
  "schema",
  "deadlock",
  "foreign key",
  "constraint",
  "p20",
  "500",
  "502",
  "503",
  "504",
  "404",
  "403",
  "401",
  "html",
  "object object",
  "undefined",
  "null",
  "failed to fetch",
  "econnrefused",
  "etimedout",
  "unexpected",
  "is not valid",
  "stack",
  "line ",
  "at ",
  "<",
  ">",
  "{",
  "}",
  "server_",
  "err_",
  "invalid_",
  "failed_",
  "unknown_",
];

export function normalizeError(
  error: unknown,
  fallbackMessage = "Unable to synchronize data with the server. Please try again."
): SafeErrorResult {
  const requestId = `req_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;

  // Log full internal error for developers / server diagnostics
  console.error(`[AdminDiagnostics:${requestId}]`, error);

  let candidateMessage = "";

  if (typeof error === "string") {
    candidateMessage = error;
  } else if (error && typeof error === "object") {
    const err = error as Record<string, unknown>;
    if (typeof err.message === "string") {
      candidateMessage = err.message;
    }
  }

  const lower = candidateMessage.toLowerCase();
  const hasTechnicalTerms = TECHNICAL_TERMS.some((term) => lower.includes(term));

  // Also reject CONSTANT_CASE strings like "SERVER_COMMUNICATION_FAILED"
  const isConstantCase = /^[A-Z0-9_]{4,}$/.test(candidateMessage.trim());

  // Also reject strings without spaces (likely error codes or class names)
  const isSingleWordCode = !candidateMessage.trim().includes(" ") && candidateMessage.length > 3;

  let safeMessage = fallbackMessage;

  // Only allow explicitly friendly, natural language human sentences
  if (
    candidateMessage &&
    !hasTechnicalTerms &&
    !isConstantCase &&
    !isSingleWordCode &&
    candidateMessage.length >= 8 &&
    candidateMessage.length <= 120
  ) {
    safeMessage = candidateMessage;
  }

  return {
    safeMessage,
    requestId,
  };
}
