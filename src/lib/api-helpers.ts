import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ZodError } from "zod";

// ─── Custom API Error ──────────────────────────────────────
export class ApiError extends Error {
  public statusCode: number;
  public code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = "ApiError";
  }
}

// ─── Standard Response Helpers ─────────────────────────────
function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

function errorResponse(
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status: statusCode }
  );
}

// ─── Format Zod Errors ────────────────────────────────────
function formatZodErrors(error: ZodError) {
  const issues = error.issues || error.errors || [];
  return issues.map((e) => ({
    field: e.path.join("."),
    message: e.message,
  }));
}

// ─── API Handler Wrapper ──────────────────────────────────
// Wraps route handlers with centralized error handling and
// consistent response formatting.
//
// Usage:
//   export const POST = apiHandler(async (request) => {
//     const body = createOrderSchema.parse(await request.json());
//     const order = await prisma.order.create({ data: body });
//     return { data: order, status: 201 };
//   });

type HandlerResult = {
  data: unknown;
  status?: number;
};

type RouteParams = { params: Record<string, string> };

type HandlerFn = (
  request: Request,
  context: RouteParams
) => Promise<HandlerResult>;

export function apiHandler(handler: HandlerFn) {
  return async (request: Request, context: RouteParams) => {
    try {
      const result = await handler(request, context);
      return successResponse(result.data, result.status ?? 200);
    } catch (error) {
      // Zod validation errors → 400
      if (error instanceof ZodError) {
        return errorResponse(
          400,
          "VALIDATION_ERROR",
          "Invalid request data",
          formatZodErrors(error)
        );
      }

      // Custom API errors (e.g. not found, unauthorized)
      if (error instanceof ApiError) {
        return errorResponse(error.statusCode, error.code, error.message);
      }

      // Prisma known request errors (e.g. unique constraint)
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as any).name === "PrismaClientKnownRequestError"
      ) {
        const prismaError = error as any;
        if (prismaError.code === "P2002") {
          return errorResponse(
            409,
            "DUPLICATE_ENTRY",
            "A record with this value already exists"
          );
        }
        if (prismaError.code === "P2025") {
          return errorResponse(404, "NOT_FOUND", "Record not found");
        }
      }

      // Unexpected errors → 500
      console.error("Unhandled API error:", error);
      return errorResponse(
        500,
        "INTERNAL_ERROR",
        "An unexpected error occurred"
      );
    }
  };
}

// ─── Auth Helpers ──────────────────────────────────────────

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
  }
  return session.user as {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

export async function requireRole(roles: string[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "You do not have permission to perform this action"
    );
  }
  return user;
}
