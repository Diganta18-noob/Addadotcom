import prisma from "@/lib/prisma";
import { protectedApiHandler } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export const PUT = protectedApiHandler(async (request, context: any) => {
  const params = await context.params;
  const id = params.id;

  const body = await request.json();
  const { approved } = body;

  const review = await prisma.review.update({
    where: { id },
    data: { approved: Boolean(approved) },
  });

  return { data: review };
});

export const DELETE = protectedApiHandler(async (request, context: any) => {
  const params = await context.params;
  const id = params.id;

  await prisma.review.delete({ where: { id } });
  return { data: { message: "Review deleted" } };
});
