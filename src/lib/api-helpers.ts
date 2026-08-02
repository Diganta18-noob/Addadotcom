import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import logger from "@/lib/logger";

// ─── Standard API Response Shape ────────────────────────────────

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// ─── API Error Class ────────────────────────────────────────────

export class ApiError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = "ApiError";
  }
}

// ─── API Handler Wrapper ────────────────────────────────────────

type HandlerResult = { data: any; status?: number };
type RouteContext = { params: Record<string, string> };
type HandlerFn = (
  request: NextRequest,
  context: RouteContext
) => Promise<HandlerResult>;

export function apiHandler(handler: HandlerFn) {
  return async (request: NextRequest, context: any) => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID().slice(0, 8);
    const pathname = new URL(request.url).pathname;

    logger.info({
      msg: "API Request",
      requestId,
      method: request.method,
      path: pathname,
    });

    try {
      const resolvedParams = context?.params
        ? typeof context.params.then === "function"
          ? await context.params
          : context.params
        : {};

      const result = await handler(request, { params: resolvedParams });
      const status = result?.status || 200;

      logger.info({
        msg: "API Response",
        requestId,
        status,
        durationMs: Date.now() - startTime,
      });

      return NextResponse.json(
        { success: true, data: result.data },
        { status }
      );
    } catch (error: unknown) {
      const durationMs = Date.now() - startTime;

      if (error instanceof ApiError) {
        logger.warn({
          msg: "API Handled Error",
          requestId,
          status: error.statusCode,
          code: error.code,
          error: error.message,
          durationMs,
        });
        return NextResponse.json(
          { success: false, message: error.message, code: error.code },
          { status: error.statusCode }
        );
      }

      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string[]> = {};
        const issues = (error as any).issues || (error as any).errors || [];
        issues.forEach((err: any) => {
          const path = Array.isArray(err.path) ? err.path.join(".") : "form";
          if (!fieldErrors[path]) fieldErrors[path] = [];
          fieldErrors[path].push(err.message);
        });

        logger.warn({
          msg: "API Validation Error",
          requestId,
          status: 400,
          errors: fieldErrors,
          durationMs,
        });

        return NextResponse.json(
          { success: false, message: "Validation Error", errors: fieldErrors },
          { status: 400 }
        );
      }

      logger.error({
        msg: "API Unhandled Error",
        requestId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        durationMs,
      });

      if (error instanceof Error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: false, message: "An unexpected server error occurred" },
        { status: 500 }
      );
    }
  };
}

export function protectedApiHandler(
  handler: HandlerFn,
  allowedRoles: string[] = ["ADMIN", "MANAGER", "STAFF"]
) {
  return apiHandler(async (request, context) => {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role?.toUpperCase();

    if (!session || !allowedRoles.map((r) => r.toUpperCase()).includes(role)) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required to perform this action");
    }
    return handler(request, context);
  });
}
