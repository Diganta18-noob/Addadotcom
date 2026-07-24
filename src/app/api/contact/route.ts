import prisma from "@/lib/prisma";
import { apiHandler, ApiError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export const POST = apiHandler(async (req) => {
  const { name, email, subject, message } = await req.json();

  if (!name || !email || !message) {
    throw new ApiError(400, "BAD_REQUEST", "Name, email, and message are required.");
  }

  const key = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  const value = JSON.stringify({ name, email, subject: subject || "General Inquiry", message, createdAt: new Date().toISOString() });

  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value, group: "contacts" },
  });

  return { data: { success: true, message: "Inquiry submitted successfully!" } };
});
