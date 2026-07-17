import prisma from "@/lib/prisma";
import { apiHandler, ApiError } from "@/lib/api-helpers";
import { validatePromoSchema } from "@/lib/validations";

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const data = validatePromoSchema.parse(body);

  const promo = await prisma.promoCode.findUnique({
    where: { code: data.code.toUpperCase() },
  });

  if (!promo || !promo.isActive) {
    throw new ApiError(404, "INVALID_PROMO", "Invalid or inactive promo code");
  }

  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    throw new ApiError(400, "PROMO_EXPIRED", "Promo code has expired");
  }

  if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
    throw new ApiError(400, "PROMO_LIMIT_REACHED", "Promo code usage limit reached");
  }

  if (data.amount < promo.minOrder) {
    throw new ApiError(
      400,
      "MIN_ORDER_NOT_MET",
      `Minimum order amount of ₹${promo.minOrder} required for this promo code`
    );
  }

  return {
    data: {
      code: promo.code,
      type: promo.type,
      value: promo.value,
      maxDiscount: promo.maxDiscount,
    },
  };
});
