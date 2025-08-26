import AppError from "../../../errors/AppError";
import prisma from "../../../utils/prisma";
import https from "http-status";
import { ProductAdminService } from "../admin/product.service";

export const getProductDetailsService = async ({ id }: { id: string }) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      reviews: { select: { rating: true } },
      variants: true,
    },
  });

  if (!product) {
    throw new AppError(https.NOT_FOUND, "Product not found");
  }

  return {
    status: "success",
    data: product,
  };
};

export const getProductReviewsService = async (req: any) => {
  // 1. Set defaults for pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let orderBy: any = { createdAt: "desc" }; // Default sort by newest

  if (req.query.sortBy) {
    switch (req.query.sortBy) {
      case "A-Z":
        orderBy = { user: { name: "asc" } }; // Assuming you want to sort by user name
        break;
      case "Z-A":
        orderBy = { user: { name: "desc" } };
        break;
      case "low-to-high":
        orderBy = { rating: "asc" };
        break;
      case "high-to-low":
        orderBy = { rating: "desc" };
        break;
      default:
        break;
    }
  }

  const [reviews, total] = await prisma.$transaction([
    prisma.reviews.findMany({
      where: { productId: req.params.id },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true } },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.reviews.count({ where: { productId: req.params.id } }),
  ]);

  return {
    status: "success",
    data: reviews,
    pagination: {
      page,
      limit,
      results: reviews.length,
      total_pages: Math.ceil(total / limit),
    },
  };
};

export const ProductService = {
  getAll: ProductAdminService.getAll,
  getOne: getProductDetailsService,
  getReviews: getProductReviewsService,
};
