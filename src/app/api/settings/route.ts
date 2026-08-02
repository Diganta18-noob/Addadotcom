import prisma from "@/lib/prisma";
import { protectedApiHandler } from "@/lib/api-helpers";
import { updateSettingsSchema } from "@/lib/validations";

export const GET = protectedApiHandler(async () => {
  const settings = await prisma.setting.findMany();
  return { data: settings };
});

export const PUT = protectedApiHandler(async (request) => {
  const body = await request.json();
  const data = updateSettingsSchema.parse(body);

  await prisma.$transaction(async (tx) => {
    if (Array.isArray(data)) {
      for (const item of data) {
        await tx.setting.upsert({
          where: { key: item.key },
          update: { value: String(item.value) },
          create: { key: item.key, value: String(item.value) },
        });
      }
    } else {
      for (const [key, value] of Object.entries(data)) {
        await tx.setting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
      }
    }
  });

  const updated = await prisma.setting.findMany();
  return { data: updated };
});
