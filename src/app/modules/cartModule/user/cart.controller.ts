import { Request, Response } from "express";

import catchAsync from "../../../utils/asyncCatch";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { CartService } from "./cart.service";

const getMyCart = catchAsync(
  async (req: Request & { user?: { id: string } }, res: Response) => {
    const result = await CartService.getMyCart({ userId: req.user!.id });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Cart retrieved successfully",
      data: result,
    });
  }
);

const addToCart = catchAsync(
  async (req: Request & { user?: { id: string } }, res: Response) => {
    const result = await CartService.addToCart({
      userId: req.user!.id,
      productId: req.body.productId,
      variantId: req.body.variantId,
      quantity: req.body.quantity,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Cart retrieved successfully",
      data: result,
    });
  }
);

export const CartController = {
  getAll: getMyCart,
  addToCart,
};
