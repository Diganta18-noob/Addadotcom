import prisma from "@/lib/prisma";
import { apiHandler, ApiError } from "@/lib/api-helpers";
import { AutomationEngine } from "@/lib/automation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/reviews — fetch approved reviews for public site or all reviews for admin
export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const admin = searchParams.get("admin") === "true";

  const reviews = await prisma.review.findMany({
    where: admin ? {} : { approved: true },
    orderBy: { createdAt: "desc" },
    take: admin ? 100 : 20,
  });

  return { data: reviews };
});

// POST /api/reviews — submit customer rating & comment
export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const { author, email, rating, comment } = body;

  if (!author || !rating || !comment) {
    throw new ApiError(400, "BAD_REQUEST", "Author, rating (1-5), and comment are required");
  }

  const review = await prisma.review.create({
    data: {
      author: String(author).trim(),
      email: email ? String(email).trim() : null,
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment: String(comment).trim(),
      approved: false, // Moderation queue default
    },
  });

  // Fire Automation Engine event asynchronously
  AutomationEngine.fire(
    "REVIEW_SUBMITTED",
    {
      reviewId: review.id,
      author: review.author,
      rating: review.rating,
      comment: review.comment,
    },
    review.id
  );

  return { data: review, status: 201 };
});
