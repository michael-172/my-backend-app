import { Request, Response } from "express";

import catchAsync from "../../../utils/asyncCatch";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { ProductAdminService } from "./product.service";

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductAdminService.create(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product created successfully",
    data: result,
  });
});

const addAttributes = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductAdminService.addAttributes({
    payload: {
      productId: id,
      attributesWithValues: req.body,
    },
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product attributes added successfully",
    data: result,
  });
});

const addVariations = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductAdminService.addVariations({
    payload: {
      productId: id,
      variations: req.body.variations,
    },
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product variations added successfully",
    data: result,
  });
});

const getProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductAdminService.getAll(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Products retrieved successfully",
    data: result,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(id);
  const result = await ProductAdminService.delete({ id });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product deleted successfully",
    data: result,
  });
});

export const ProductAdminController = {
  create: createProduct,
  getAll: getProducts,
  delete: deleteProduct,
  addAttributes,
  addVariations,
};
