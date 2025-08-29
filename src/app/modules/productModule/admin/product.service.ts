import AppError from "../../../errors/AppError";
import prisma from "../../../utils/prisma";
import { buildSearchFilter } from "../../../utils/search";
import https from "http-status";
import env from "../../../config";

const sortOptions = ["A-Z", "Z-A", "low-to-high", "high-to-low"];
export const createProduct = async (productData: CreateProductPayload) => {
  const category = await prisma.categories.findUnique({
    where: { id: +productData.categoryId },
  });
  if (!category) {
    return Promise.reject(new AppError(https.NOT_FOUND, "Category not found"));
  }

  const product = await prisma.product.create({
    data: {
      name: productData.name,
      description: productData.description,
      price: productData.price ? String(productData.price) : "0",
      priceAfterDiscount: productData.priceAfterDiscount
        ? String(productData.priceAfterDiscount)
        : "0",
      sku: productData.sku,
      categoryId: +productData.categoryId,
      images: productData.images, // must already be an array
      // variants: {
      //   create: productData?.variants.map((variant) => ({
      //     attributes: variant.attributes, // must be JSON, not string
      //     image: variant.image,
      //     stock: variant.stock ? +variant.stock : 0,
      //     price: variant.price ? String(variant.price) : "0",
      //     sku: variant.sku,
      //   })),
      // },
    },
    // include: { variants: true },
  });

  return product;
};

const updateProduct = async ({
  productId,
  data,
}: {
  productId: string;
  data: UpdateProductPayload;
}) => {
  const product = await prisma.product.findUnique({
    where: { id: +productId },
  });
  if (!product) {
    return Promise.reject(new AppError(https.NOT_FOUND, "Product not found"));
  }

  const updatedProduct = await prisma.product.update({
    where: { id: +productId },
    data: {
      name: data.name ?? undefined,
      price: data.price ? String(data.price) : "0",
      images: data.images ?? undefined,
      description: data.description ?? undefined,
      sku: data.sku ?? undefined,
      categoryId: data.categoryId ? +data.categoryId : undefined,
      status: data.status ?? undefined,
      priceAfterDiscount: data.priceAfterDiscount
        ? String(data.priceAfterDiscount)
        : "0",
    },
  });

  return updatedProduct;
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
          // variants: true,
          categoryId: true,
          sku: true,
          createdAt: true,
          updatedAt: true,
          reviews: true,
          attributes: {
            select: {
              id: true,
              name: true,
              values: {
                select: {
                  value: true,
                },
              },
            },
          },
          variations: {
            select: {
              id: true,
              price: true,
              stock: true,
              sku: true,
              attributes: {
                select: {
                  id: true,
                  attributeValue: {
                    select: {
                      id: true,
                      value: true,
                      productAttribute: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
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

    const data = products.map((p) => {
      const ratings = p.reviews?.map((r) => r.rating) ?? [];
      const rating_average =
        ratings.length > 0
          ? Number(
              (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)
            )
          : 0;

      return {
        id: p.id,
        name: p.name,
        price: p.price,
        priceAfterDiscount: p.priceAfterDiscount,
        sku: p.sku,
        images: p.images,
        status: p.status,
        rating_average,
        attributes: p.attributes.map((attr) => ({
          id: attr.id,
          name: attr.name,
          values: attr.values.map((val) => ({
            // id: val.id,
            value: val.value,
          })),
        })),
        variations: p.variations.map((v) => ({
          id: v.id,
          price: v.price,
          attributes: v.attributes.map((a) => ({
            id: a.id,
            attributeValueId: a.attributeValue.id,
            name: a.attributeValue.productAttribute.name,
            value: a.attributeValue.value,
          })),
        })),
      };
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
  const product = await prisma.product.findFirst({
    where: { id: +id },
  });

  if (!product) {
    throw new AppError(https.NOT_FOUND, "Product not found");
  }

  await prisma.product.delete({
    where: { id: +id },
  });

  return {
    status: "success",
    message: "product deleted successfully",
  };
};

const addProductAttributesService = async ({
  payload,
}: {
  payload: createAttributesPayload;
}) => {
  const { attributesWithValues, productId } = payload;

  // Ensure product exists
  const product = await prisma.product.findUnique({
    where: { id: +productId },
  });
  if (!product) {
    throw new AppError(https.NOT_FOUND, "Product not found");
  }

  // Create all attributes with their values in a single transaction
  const createAttributes = await prisma.$transaction(
    attributesWithValues.map((attr) =>
      prisma.productAttribute.create({
        data: {
          name: attr.name,
          productId: product.id,
          values: {
            create: attr.values.map((value: string) => ({
              value,
            })),
          },
        },
        include: {
          values: true, // return created values too
        },
      })
    )
  );

  return {
    status: "success",
    data: createAttributes,
  };
};

const addVariationsService = async ({
  payload,
}: {
  payload: createVariationsPayload;
}) => {
  const { variations, productId } = payload;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError(https.NOT_FOUND, "Product not found");
  }

  // Validate attributeValueIds
  for (const variation of variations) {
    for (const attrValueId of variation.attributeValueIds) {
      const attrValue = await prisma.attributeValue.findUnique({
        where: { id: attrValueId },
        include: { productAttribute: true },
      });
      if (!attrValue || attrValue.productAttribute.productId !== productId) {
        throw new AppError(
          https.BAD_REQUEST,
          `Invalid attribute value ID: ${attrValueId}`
        );
      }
    }
  }

  // Create variations
  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: {
      variations: {
        create: variations.map((v) => ({
          sku: v.sku,
          price: v.price,
          stock: v.stock,
          attributes: {
            create: v.attributeValueIds.map((id) => ({
              attributeValueId: id,
            })),
          },
        })),
      },
    },
    include: {
      variations: {
        include: {
          attributes: {
            include: { attributeValue: true },
          },
        },
      },
    },
  });

  return {
    status: "success",
    data: updatedProduct,
  };
};

export const getProductDetailsService = async ({ id }: { id: string }) => {
  const product = await prisma.product.findUnique({
    where: { id: +id },
  });

  if (!product) {
    throw new AppError(https.NOT_FOUND, "Product not found");
  }

  // const averageRating = product..reduce((acc, review) => acc + review.rating, 0) / product.reviews.length || 0;

  return {
    status: "success",
    data: product,
  };
};

const getProductAttributesService = async ({
  productId,
}: {
  productId: string;
}) => {
  const attributes = await prisma.productAttribute.findMany({
    where: { productId: +productId },
    include: { values: true },
  });

  return {
    status: "success",
    data: attributes,
  };
};

const deleteProductAttributeService = async ({
  productId,
  attributeId,
}: {
  productId: string;
  attributeId: string;
}) => {
  const product = await prisma.product.findUnique({
    where: { id: +productId },
  });
  if (!product) {
    throw new AppError(https.NOT_FOUND, "Product not found");
  }

  await prisma.productAttribute.delete({
    where: { id: +attributeId },
  });

  return {
    status: "success",
    message: "Product attribute deleted successfully",
  };
};

const updateProductAttributeService = async ({
  productId,
  attributeId,
  data,
}: {
  productId: string;
  attributeId: string;
  data: Partial<ProductAttribute>;
}) => {
  const product = await prisma.product.findUnique({
    where: { id: +productId },
  });
  if (!product) {
    throw new AppError(https.NOT_FOUND, "Product not found");
  }

  const attribute = await prisma.productAttribute.findUnique({
    where: { id: +attributeId },
  });
  if (!attribute) {
    throw new AppError(https.NOT_FOUND, "Product attribute not found");
  }
  await prisma.$transaction(async (tx) => {
    // delete missing values
    const existing = await tx.attributeValue.findMany({
      where: { productAttributeId: +attributeId },
    });

    const incomingIds = data.values?.map((v) => v.id).filter(Boolean) ?? [];
    const toDelete = existing.filter((ev) => !incomingIds.includes(ev.id));

    if (toDelete.length > 0) {
      await tx.attributeValue.deleteMany({
        where: { id: { in: toDelete.map((d) => d.id) } },
      });
    }

    // update attribute + upsert values
    return tx.productAttribute.update({
      where: { id: +attributeId },
      data: {
        name: data.name ?? undefined,
        values: data.values
          ? {
              upsert: data.values.map((v) => ({
                where: { id: v.id ?? 0 },
                create: { value: v.value },
                update: { value: v.value },
              })),
            }
          : undefined,
      },
      include: { values: true },
    });
  });
};

const getVariationsService = async ({ productId }: { productId: string }) => {
  const variations = await prisma.productVariation.findMany({
    where: { productId: +productId },
    include: {
      attributes: {
        include: { attributeValue: true },
      },
    },
  });

  return {
    status: "success",
    data: variations,
  };
};

const deleteVariationService = async ({
  productId,
  variationId,
}: {
  productId: string;
  variationId: string;
}) => {
  const product = await prisma.product.findUnique({
    where: { id: +productId },
  });
  if (!product) {
    throw new AppError(https.NOT_FOUND, "Product not found");
  }

  await prisma.productVariation.delete({
    where: { id: +variationId },
  });

  return {
    status: "success",
    message: "Product variation deleted successfully",
  };
};

const updateVariationService = async ({
  productId,
  variationId,
  data,
}: {
  productId: string;
  variationId: string;
  data: Partial<ProductVariation> & {
    attributes?: { attributeValueId: number }[];
  };
}) => {
  // Ensure product exists
  const product = await prisma.product.findUnique({
    where: { id: +productId },
  });
  if (!product) {
    throw new AppError(https.NOT_FOUND, "Product not found");
  }

  // Ensure variation exists
  const variation = await prisma.productVariation.findUnique({
    where: { id: +variationId },
    include: { attributes: true },
  });
  if (!variation) {
    throw new AppError(https.NOT_FOUND, "Product variation not found");
  }

  // Run updates in a transaction
  const updatedVariation = await prisma.$transaction(async (tx) => {
    // Step 1: remove old attributes if new ones provided
    if (data.attributes) {
      await tx.variationAttribute.deleteMany({
        where: { productVariationId: +variationId },
      });

      await tx.variationAttribute.createMany({
        data: data.attributes.map((attr) => ({
          attributeValueId: attr.attributeValueId,
          productVariationId: +variationId,
        })),
      });
    }

    // Step 2: update variation fields
    return tx.productVariation.update({
      where: { id: +variationId },
      data: {
        sku: data.sku ?? undefined,
        price: data.price ?? undefined,
        stock: data.stock ?? undefined,
      },
      include: {
        attributes: {
          include: { attributeValue: { include: { productAttribute: true } } },
        },
      },
    });
  });

  return {
    status: "success",
    data: updatedVariation,
  };
};

export const ProductAdminService = {
  create: createProduct,
  update: updateProduct,
  getAll: getAllProductsService,
  delete: deleteProductService,
  addAttributes: addProductAttributesService,
  addVariations: addVariationsService,
  getAttributes: getProductAttributesService,
  deleteAttribute: deleteProductAttributeService,
  updateAttribute: updateProductAttributeService,
  getVariations: getVariationsService,
  deleteVariation: deleteVariationService,
  updateVariation: updateVariationService,
};

// export const deleteProductService = asyncHandler(async (id: string) => {
//   const product = await prisma.product.findUnique({ where: { id: +id } });

//   if (!product) {
//     throw new AppError(https.NOT_FOUND, "Product not found");
//   }

//   await prisma.product.delete({
//     where: { id: +id },
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
