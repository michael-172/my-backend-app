import AppError from "../../../errors/AppError";
import httpStatus from "http-status";
import prisma from "../../../utils/prisma";

export const getMyCart = async ({ userId }: { userId: number }) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: { userId },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        cart_items: {
          select: {
            id: true,
            quantity: true,
            product: true,
            productVariation: true,
          },
        },
      },
    });
    return cart;
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to retrieve cart"
    );
  }
};

export const addToCart = async ({
  userId,
  productId,
  productVariationId,
  quantity,
}: {
  userId: number;
  productId: number;
  productVariationId: number;
  quantity: number;
}) => {
  try {
    // Find the user's cart or create one if it doesn't exist
    const userCart = await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    console.log(productVariationId, "productVariationId");

    // Check if the product variation exists and has enough stock
    const productVariation = await prisma.productVariation.findUnique({
      where: { id: Number(productVariationId) },
    });

    if (!productVariation) {
      throw new AppError(httpStatus.NOT_FOUND, "Product variation not found");
    }

    if (productVariation.stock < quantity) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Not enough stock. Only ${productVariation.stock} available.`
      );
    }

    // Check if the item is already in the cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: userCart.id,
        productId,
        productVariationId,
      },
    });

    if (existingCartItem) {
      // If it exists, update the quantity
      const updatedCartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
      });
      return updatedCartItem;
    } else {
      // If it doesn't exist, create a new cart item
      const newCartItem = await prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          productId,
          productVariationId,
          quantity,
        },
      });
      return newCartItem;
    }
  } catch (error: any) {
    throw new AppError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to add item to cart"
    );
  }
};

export const removeItemFromCart = async ({
  userId,
  cartItemId,
}: {
  userId: number;
  cartItemId: number;
}) => {
  try {
    // Find the user's cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        Cart: { userId },
      },
    });

    if (!cartItem) {
      throw new AppError(httpStatus.NOT_FOUND, "Cart item not found");
    }

    // Remove the item from the cart
    await prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    // check if cart has items left
    const cart = await prisma.cart.findUnique({
      where: { id: cartItem.cartId },
    });

    if (cart) {
      // If the cart is empty after removing the item, delete the cart
      const cartItems = await prisma.cartItem.findMany({
        where: { cartId: cart.id },
      });

      if (cartItems.length === 0) {
        await prisma.cart.delete({
          where: { id: cart.id },
        });
      }
    }

    return cartItem;
  } catch (error: any) {
    throw new AppError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to remove item from cart"
    );
  }
};

export const increaseCartItemQuantity = async ({
  userId,
  cartItemId,
}: {
  userId: number;
  cartItemId: number;
}) => {
  try {
    // Find the user's cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        Cart: { userId },
      },
    });

    if (!cartItem) {
      throw new AppError(httpStatus.NOT_FOUND, "Cart item not found");
    }

    // Increase the quantity
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: {
        quantity: cartItem.quantity + 1,
      },
    });

    return updatedCartItem;
  } catch (error: any) {
    throw new AppError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to increase cart item quantity"
    );
  }
};

const decreaseCartItemQuantity = async ({
  userId,
  cartItemId,
}: {
  userId: number;
  cartItemId: number;
}) => {
  try {
    // Find the user's cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        Cart: { userId },
      },
    });

    if (!cartItem) {
      throw new AppError(httpStatus.NOT_FOUND, "Cart item not found");
    }

    if (cartItem.quantity <= 1) {
      await prisma.cartItem.delete({
        where: { id: cartItem.id },
      });

      const cart = await prisma.cart.findUnique({
        where: { id: cartItem.cartId },
      });

      if (cart) {
        // If the cart is empty after removing the item, delete the cart
        const cartItems = await prisma.cartItem.findMany({
          where: { cartId: cart.id },
        });

        if (cartItems.length === 0) {
          await prisma.cart.delete({
            where: { id: cart.id },
          });
        }
      }

      return null;
    }

    // Decrease the quantity
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: {
        quantity: cartItem.quantity - 1,
      },
    });

    return updatedCartItem;
  } catch (error: any) {
    throw new AppError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to decrease cart item quantity"
    );
  }
};

export const CartService = {
  getMyCart,
  addToCart,
  removeFromCart: removeItemFromCart,
  increase: increaseCartItemQuantity,
  decrease: decreaseCartItemQuantity,
};
