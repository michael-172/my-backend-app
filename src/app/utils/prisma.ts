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

const prisma = getPrismaClient().$extends({
  result: {
    product: {
      images: {
        needs: { images: true },
        compute(product) {
          if (product.images) {
            return product.images.map(
              (image) => `${BASE_URL.BASE_URL}/${image}`
            );
          }
          return [];
        },
      },
    },
  },
});

export default prisma;
