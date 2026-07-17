import prisma from "@/lib/prisma";
import { apiHandler, ApiError } from "@/lib/api-helpers";
import { updateMenuItemSchema } from "@/lib/validations";

export const GET = apiHandler(async (request, { params }) => {
  const item = await prisma.menuItem.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  if (!item) {
    throw new ApiError(404, "NOT_FOUND", "Menu item not found");
  }

  return { data: item };
});

export const PUT = apiHandler(async (request, { params }) => {
  const body = await request.json();
  const data = updateMenuItemSchema.parse(body);

  const item = await prisma.menuItem.update({
    where: { id: params.id },
    data: {
      ...(data.categoryId && { categoryId: data.categoryId }),
      ...(data.name && { name: data.name }),
      ...(data.slug && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.image !== undefined && { image: data.image }),
      ...(data.tags !== undefined && {
        tags: Array.isArray(data.tags) ? data.tags.join(",") : data.tags,
      }),
      ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
      ...(data.prepTime !== undefined && { prepTime: data.prepTime ?? null }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...(data.isSpecial !== undefined && { isSpecial: data.isSpecial }),
      ...(data.isBestseller !== undefined && { isBestseller: data.isBestseller }),
      ...(data.variants !== undefined && { variants: data.variants }),
      ...(data.addons !== undefined && { addons: data.addons }),
    },
    include: { category: true },
  });

  return { data: item };
});

export const DELETE = apiHandler(async (request, { params }) => {
  await prisma.menuItem.delete({ where: { id: params.id } });
  return { data: { message: "Item deleted" } };
});
