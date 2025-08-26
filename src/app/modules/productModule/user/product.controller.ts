import { Request, Response } from "express";

import catchAsync from "../../../utils/asyncCatch";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { ProductService } from "./product.service";

const getProductDetailsService = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ProductService.getOne({ id: req.params.id });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Product retrieved successfully",
      data: result,
    });
  }
);

const getProductReviewsService = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ProductService.getReviews(req);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Product reviews retrieved successfully",
      data: result,
    });
  }
);

export const ProductController = {
  getAll: ProductService.getAll,
  getOne: getProductDetailsService,
  getReviews: getProductReviewsService,
};
