import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, amount } = body;

    if (!code) {
      return NextResponse.json({ success: false, error: "Promo code required" }, { status: 400 });
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo || !promo.isActive) {
      return NextResponse.json({ success: false, error: "Invalid or inactive promo code" }, { status: 404 });
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return NextResponse.json({ success: false, error: "Promo code has expired" }, { status: 400 });
    }

    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      return NextResponse.json({ success: false, error: "Promo code usage limit reached" }, { status: 400 });
    }

    if (amount && amount < promo.minOrder) {
      return NextResponse.json({
        success: false,
        error: `Minimum order amount of ₹${promo.minOrder} required for this promo code`,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        code: promo.code,
        type: promo.type,
        value: promo.value,
        maxDiscount: promo.maxDiscount,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to validate promo code" }, { status: 500 });
  }
}
