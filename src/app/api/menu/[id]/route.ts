import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: params.id },
      include: { category: true },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Menu item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch menu item" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const item = await prisma.menuItem.update({
      where: { id: params.id },
      data: {
        ...(body.categoryId && { categoryId: body.categoryId }),
        ...(body.name && { name: body.name }),
        ...(body.slug && { slug: body.slug }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.price !== undefined && { price: parseFloat(body.price) }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.tags && { tags: body.tags }),
        ...(body.isAvailable !== undefined && { isAvailable: body.isAvailable }),
        ...(body.prepTime !== undefined && { prepTime: body.prepTime ? parseInt(body.prepTime) : null }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.isSpecial !== undefined && { isSpecial: body.isSpecial }),
        ...(body.isBestseller !== undefined && { isBestseller: body.isBestseller }),
        ...(body.variants !== undefined && { variants: body.variants }),
        ...(body.addons !== undefined && { addons: body.addons }),
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update menu item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.menuItem.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: "Item deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}
