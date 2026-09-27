/**
 * Safe Error Normalizer
 * NEVER exposes raw database, Prisma, SQL, or internal stack traces to the user.
 * Sanitizes messages and generates a unique Request ID for diagnostic tracing.
 */

export interface SafeErrorResult {
  safeMessage: string;
  requestId: string;
}

export function normalizeError(error: unknown, fallbackMessage = "Unable to complete request. Please try again."): SafeErrorResult {
  const requestId = `req_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;

  // Log full internal error for developers / server diagnostics
  if (process.env.NODE_ENV !== "production") {
    console.error(`[AdminError:${requestId}]`, error);
  }

  // Determine user-safe explanation
  let safeMessage = fallbackMessage;

  if (typeof error === "string") {
    // Check if error contains sensitive tech jargon
    if (!/prisma|sql|database|column|select|insert|update|syntax|deadlock|foreign key|p20/i.test(error)) {
      safeMessage = error;
    }
  } else if (error && typeof error === "object") {
    const err = error as Record<string, unknown>;
    const rawMsg = typeof err.message === "string" ? err.message : "";

    // Filter out common raw tech traces
    if (rawMsg && !/prisma|sql|database|column|select|insert|update|syntax|deadlock|foreign key|p20/i.test(rawMsg)) {
      if (rawMsg.length < 120) {
        safeMessage = rawMsg;
      }
    }
  }

  return {
    safeMessage,
    requestId,
  };
}
