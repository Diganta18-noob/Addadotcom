import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

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
// Wraps route handlers with standard JSON response formatting
// and centralized error handling (Zod, ApiError, generic errors).

type HandlerResult = { data: any; status?: number };
type RouteContext = { params: Record<string, string> };
type HandlerFn = (
  request: NextRequest,
  context: RouteContext
) => Promise<HandlerResult>;

export function apiHandler(handler: HandlerFn) {
  return async (request: NextRequest, context: any) => {
    try {
      // Next.js 14 passes params as a promise in some versions
      const resolvedParams = context?.params
        ? typeof context.params.then === "function"
          ? await context.params
          : context.params
        : {};

      const result = await handler(request, { params: resolvedParams });

      return NextResponse.json(
        { success: true, data: result.data },
        { status: result.status || 200 }
      );
    } catch (error: unknown) {
      console.error("API Error:", error);

      if (error instanceof ApiError) {
        return NextResponse.json(
          { success: false, message: error.message, code: error.code },
          { status: error.statusCode }
        );
      }

      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const path = err.path.join(".") || "form";
          if (!fieldErrors[path]) fieldErrors[path] = [];
          fieldErrors[path].push(err.message);
        });

        return NextResponse.json(
          { success: false, message: "Validation Error", errors: fieldErrors },
          { status: 400 }
        );
      }

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
