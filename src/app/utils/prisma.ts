import { PrismaClient } from "../../../generated/prisma/index";
import BASE_URL from "../config";

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const getPrismaClient = () => {
  if (process.env.NODE_ENV === "production") {
    return new PrismaClient();
  }
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  return global.prisma;
};

const prisma = getPrismaClient();

// .$extends({
//   result: {
//     product: {
//       images: {
//         needs: { images: true },
//         compute(product) {
//           if (product.images) {
//             return product.images.map(
//               (image) => `${BASE_URL}/uploads/products/${image}`
//             );
//           }
//           return [];
//         },
//       },
//       variants: {
//         needs: {
//           variants: {
//             select: {
//               id: true,
//               name: true,
//               price: true,
//               stock: true,
//               productId: true,
//               image: true,
//             },
//           },
//         },
//         compute(product) {
//           if (product.variants) {
//             return product.variants.map((variant) => {
//               if (variant.image) {
//                 return {
//                   ...variant,
//                   image: `${BASE_URL}/uploads/products/variants/${variant.image}`,
//                 };
//               }
//               return variant;
//             });
//           }
//           return [];
//         },
//       },
//     },
//   },
// });

export default prisma;
