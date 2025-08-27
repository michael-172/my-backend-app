import AppError from "../../../errors/AppError";
import httpStatus from "http-status";
import prisma from "../../../utils/prisma";

const getMyWhishList = async ({ userId }: { userId: string }) => {
  try {
    const whishList = await prisma.whishList.findFirst({
      where: { userId: userId },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        WhishListItems: {
          select: {
            id: true,
            product: true,
          },
        },
      },
    });
    return whishList;
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to retrieve whishlist"
    );
  }
};

const addToWhishList = async ({
  userId,
  productId,
}: {
  userId: string;
  productId: string;
}) => {
  try {
    let userWhishList = await prisma.whishList.findFirst({
      where: { userId: userId },
    });

    if (!userWhishList) {
      userWhishList = await prisma.whishList.create({
        data: { userId },
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError(httpStatus.NOT_FOUND, "Product not found");
    }

    const existingWhishListItem = await prisma.whishListItem.findFirst({
      where: {
        whishListId: userWhishList.id,
        productId: productId,
      },
    });

    if (existingWhishListItem) {
      throw new AppError(httpStatus.BAD_REQUEST, "Item already in whishlist");
    } else {
      const newWhishListItem = await prisma.whishListItem.create({
        data: {
          whishListId: userWhishList.id,
          productId: productId,
        },
      });
      return newWhishListItem;
    }
  } catch (error: any) {
    throw new AppError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to add item to whishlist"
    );
  }
};

const removeFromWhishList = async ({
  userId,
  whishListItemId,
}: {
  userId: string;
  whishListItemId: string;
}) => {
  try {
    const whishListItem = await prisma.whishListItem.findFirst({
      where: {
        id: whishListItemId,
        WhishList: { userId: userId },
      },
    });

    if (!whishListItem) {
      throw new AppError(httpStatus.NOT_FOUND, "Whishlist item not found");
    }

    await prisma.whishListItem.delete({
      where: { id: whishListItem.id },
    });

    const whishList = await prisma.whishList.findUnique({
      where: { id: whishListItem.whishListId },
    });

    if (whishList) {
      const whishListItems = await prisma.whishListItem.findMany({
        where: { whishListId: whishList.id },
      });

      if (whishListItems.length === 0) {
        await prisma.whishList.delete({
          where: { id: whishList.id },
        });
      }
    }

    return whishListItem;
  } catch (error: any) {
    throw new AppError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to remove item from whishlist"
    );
  }
};

export const WhishListService = {
  getMyWhishList,
  addToWhishList,
  removeFromWhishList,
};
