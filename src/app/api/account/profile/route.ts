import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/utils/apiResponse";
import { HTTP_STATUS } from "@/constants";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return sendError("Not authenticated", HTTP_STATUS.UNAUTHORIZED);
    }

    const body = await req.json();
    const { name, phone } = body;

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(name && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone.trim() }),
      },
    });

    return sendSuccess(
      { name: updatedUser.name, phone: updatedUser.phone },
      "Profile updated successfully"
    );
  } catch (error: any) {
    return sendError(error.message || "Failed to update profile", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
