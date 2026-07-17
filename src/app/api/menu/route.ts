import prisma from "@/lib/prisma";
import { apiHandler } from "@/lib/api-helpers";
import { createMenuItemSchema } from "@/lib/validations";
import { CacheManager, CACHE_KEYS } from "@/lib/redis";

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const tags = searchParams.get("tags");
  const available = searchParams.get("available");
  const special = searchParams.get("special");

  // Check cache for default unfiltered menu load
  const isDefaultQuery = !category && !search && !tags && !available && !special;
  if (isDefaultQuery) {
    const cachedData = CacheManager.get(CACHE_KEYS.PUBLIC_MENU);
    if (cachedData) {
      return { data: cachedData };
    }
  }

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

  const items = await prisma.menuItem.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { category: true },
  });

  const responseData = { categories, items };

  if (isDefaultQuery) {
    CacheManager.set(CACHE_KEYS.PUBLIC_MENU, responseData, 3600); // 1 hour TTL
  }

  return { data: responseData };
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const data = createMenuItemSchema.parse(body);

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

  // Invalidate public menu cache
  CacheManager.del(CACHE_KEYS.PUBLIC_MENU);

  return { data: item, status: 201 };
});
