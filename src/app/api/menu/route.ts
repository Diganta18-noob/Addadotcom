import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
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

    if (tags) {
      const tagList = tags.split(",");
      where.tags = { hasSome: tagList };
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

    return NextResponse.json({
      success: true,
      data: { categories, items },
    });
  } catch (error) {
    console.error("Menu API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      categoryId,
      name,
      slug,
      description,
      price,
      image,
      tags,
      isAvailable,
      prepTime,
      sortOrder,
      isSpecial,
      isBestseller,
      variants,
      addons,
    } = body;

    const item = await prisma.menuItem.create({
      data: {
        categoryId,
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        description,
        price: parseFloat(price),
        image,
        tags: tags || [],
        isAvailable: isAvailable ?? true,
        prepTime: prepTime ? parseInt(prepTime) : null,
        sortOrder: sortOrder || 0,
        isSpecial: isSpecial || false,
        isBestseller: isBestseller || false,
        variants: variants || [],
        addons: addons || [],
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    console.error("Menu Create Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}
