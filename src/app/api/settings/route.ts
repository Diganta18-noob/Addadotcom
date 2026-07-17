import prisma from "@/lib/prisma";
import { apiHandler } from "@/lib/api-helpers";
import { updateSettingsSchema } from "@/lib/validations";

export const GET = apiHandler(async () => {
  const settings = await prisma.setting.findMany();
  return { data: settings };
});

export const PUT = apiHandler(async (request) => {
  const body = await request.json();
  const data = updateSettingsSchema.parse(body);

  if (Array.isArray(data)) {
    for (const item of data) {
      await prisma.setting.upsert({
        where: { key: item.key },
        update: { value: String(item.value) },
        create: { key: item.key, value: String(item.value) },
      });
    }
  } else {
    // data is a Record<string, string>
    for (const [key, value] of Object.entries(data)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }
  }

  const updated = await prisma.setting.findMany();
  return { data: updated };
});
