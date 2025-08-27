import AppError from "../../../errors/AppError";
import prisma from "../../../utils/prisma";
import { buildSearchFilter } from "../../../utils/search";
import https from "http-status";
import env from "../../../config";

const sortOptions = ["A-Z", "Z-A", "low-to-high", "high-to-low"];
export const createProduct = async (productData: CreateProductPayload) => {
  const product = await prisma.product.create({
    data: {
      name: productData.name,
      description: productData.description,
      price: productData.price ? String(productData.price) : "0",
      priceAfterDiscount: productData.priceAfterDiscount
        ? String(productData.priceAfterDiscount)
        : "0",
      sku: productData.sku,
      categoryId: productData.categoryId,
      images: productData.images, // must already be an array
      variants: {
        create: productData?.variants.map((variant) => ({
          attributes: variant.attributes, // must be JSON, not string
          image: variant.image,
          stock: variant.stock ? +variant.stock : 0,
          price: variant.price ? String(variant.price) : "0",
          sku: variant.sku,
        })),
      },
    },
    include: { variants: true },
  });

  return product;
};

export const getAllProductsService = async (reqQuery: {
  page?: number;
  limit?: number;
  categoryId?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: string;
}) => {
  try {
    // 1. Pagination
    const page = Number(reqQuery.page) || 1;
    const limit = Number(reqQuery.limit) || 10;
    const skip = (page - 1) * limit;

    // 2. Filters
    const where: any = {};
    if (reqQuery.categoryId) {
      const ids = Array.isArray(reqQuery.categoryId)
        ? reqQuery.categoryId
        : [reqQuery.categoryId];
      where.categoryId = { in: ids };
    }
    if (reqQuery.minPrice && reqQuery.maxPrice) {
      where.price = {
        gte: +reqQuery.minPrice,
        lte: +reqQuery.maxPrice,
      };
    }
    if (reqQuery.search) {
      const searchableFields = [
        "name",
        "description",
        "sku",
        // "price",
        // "priceAfterDiscount",
      ];
      const searchFilter = buildSearchFilter(searchableFields, reqQuery.search);
      if (searchFilter.OR) {
        where.OR = searchFilter.OR;
      }
    }

    // 3. Sort
    let orderBy: any = { createdAt: "desc" };
    switch (reqQuery.sortBy) {
      case "A-Z":
        orderBy = { name: "asc" };
        break;
      case "Z-A":
        orderBy = { name: "desc" };
        break;
      case "low-to-high":
        orderBy = { price: "asc" };
        break;
      case "high-to-low":
        orderBy = { price: "desc" };
        break;
      default:
        // keep default createdAt desc
        break;
    }

    // 4. Query with reviews for rating_average
    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          price: true,
          average_ratings: true,
          priceAfterDiscount: true,
          images: true,
          status: true,
          variants: true,
          categoryId: true,
          sku: true,
          createdAt: true,
          updatedAt: true,
          reviews: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);
    if (!products.length) {
      return Promise.reject(new AppError(https.NOT_FOUND, "No products found"));
    }

    const data = products.map((p: IProduct) => {
      const ratings = p.reviews?.map((r) => r.rating) ?? [];
      const rating_average =
        ratings.length > 0
          ? Number(
              (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)
            )
          : 0;
      // map over images and add base url to them
      // const images = p.images.map((img) => `${env.BASE_URL}/${img}`);
      const { reviews, ...rest } = p;
      return { ...rest, rating_average };
    });
    return {
      status: "success",
      data,
      pagination: {
        page,
        limit,
        results: data.length,
        total_pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new AppError(
      https.INTERNAL_SERVER_ERROR,
      "Failed to retrieve products"
    );
  }
};

export const deleteProductService = async ({ id }: { id: string }) => {
  const product = await prisma.product
    .findFirst({
      where: { id },
    })
    .then((prod) => {
      if (!prod) {
        throw new Error("Product not found");
      }
      return {
        status: "success",
        message: "product deleted successfully",
      };
    });
};

export const ProductAdminService = {
  create: createProduct,
  getAll: getAllProductsService,
  delete: deleteProductService,
};

// export const getProductDetailsService = asyncHandler(async (id) => {
//   const product = await prisma.product.findUnique({
//     where: { id },
//     include: {
//       reviews: { select: { rating: true } },
//       variants: true,
//     },
//   });

//   if (!product) {
//     throw new AppError(https.NOT_FOUND, "Product not found");
//   }

//   return {
//     status: "success",
//     data: product,
//   };
// });

// export const deleteProductService = asyncHandler(async (id: string) => {
//   const product = await prisma.product.findUnique({ where: { id } });

//   if (!product) {
//     throw new AppError(https.NOT_FOUND, "Product not found");
//   }

//   await prisma.product.delete({
//     where: { id },
//   });

//   return {
//     status: "success",
//     message: "product deleted successfully",
//   };
// });

// export const getProductReviewsService = asyncHandler(async (req: any) => {
//   // 1. Set defaults for pagination
//   const page = Number(req.query.page) || 1;
//   const limit = Number(req.query.limit) || 10;
//   const skip = (page - 1) * limit;

//   let orderBy: any = { createdAt: "desc" }; // Default sort by newest

//   if (req.query.sortBy) {
//     switch (req.query.sortBy) {
//       case "A-Z":
//         orderBy = { user: { name: "asc" } }; // Assuming you want to sort by user name
//         break;
//       case "Z-A":
//         orderBy = { user: { name: "desc" } };
//         break;
//       case "low-to-high":
//         orderBy = { rating: "asc" };
//         break;
//       case "high-to-low":
//         orderBy = { rating: "desc" };
//         break;
//       default:
//         break;
//     }
//   }

//   const [reviews, total] = await prisma.$transaction([
//     prisma.review.findMany({
//       where: { productId: req.params.id },
//       include: {
//         user: { select: { name: true, email: true } },
//         product: { select: { name: true } },
//       },
//       orderBy,
//       skip,
//       take: limit,
//     }),
//     prisma.review.count({ where: { productId: req.params.id } }),
//   ]);

//   return {
//     status: "success",
//     data: reviews,
//     pagination: {
//       page,
//       limit,
//       results: reviews.length,
//       total_pages: Math.ceil(total / limit),
//     },
//   };
// });
