import prisma from "@/lib/prisma";
import { apiHandler } from "@/lib/api-helpers";
import { createMenuItemSchema } from "@/lib/validations";

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const tags = searchParams.get("tags");
  const available = searchParams.get("available");
  const special = searchParams.get("special");

  const where: any = {};

  if (category && category !== "all") {
    where.category = { slug: category };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Fix: Use `contains` instead of `hasSome` — tags is stored as a
  // comma-separated string in SQLite, not an array.
  if (tags) {
    const tagList = tags.split(",").map((t) => t.trim());
    where.AND = tagList.map((tag) => ({
      tags: { contains: tag },
    }));
  }

  if (available === "true") {
    where.isAvailable = true;
  }

  if (special === "true") {
    where.isSpecial = true;
  }

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      items: {
        where,
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  // If filtering, also get items directly
  const items = await prisma.menuItem.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { category: true },
  });

  return { data: { categories, items } };
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const data = createMenuItemSchema.parse(body);

  // Convert tags array to comma-separated string if needed
  const tagsValue = Array.isArray(data.tags) ? data.tags.join(",") : data.tags;

  const item = await prisma.menuItem.create({
    data: {
      categoryId: data.categoryId,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
      description: data.description,
      price: data.price,
      image: data.image,
      tags: tagsValue || "",
      isAvailable: data.isAvailable ?? true,
      prepTime: data.prepTime ?? null,
      sortOrder: data.sortOrder || 0,
      isSpecial: data.isSpecial || false,
      isBestseller: data.isBestseller || false,
      variants: data.variants || [],
      addons: data.addons || [],
    },
    include: { category: true },
  });

  return { data: item, status: 201 };
});
