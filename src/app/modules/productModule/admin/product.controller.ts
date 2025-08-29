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

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductAdminService.update({
    productId: id,
    data: req.body,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product updated successfully",
    data: result,
  });
});

const addAttributes = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductAdminService.addAttributes({
    payload: {
      productId: +id,
      attributesWithValues: req.body.attributes,
    },
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product attributes added successfully",
    data: result,
  });
});

const getAttributes = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductAdminService.getAttributes({ productId: id });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product attributes retrieved successfully",
    data: result,
  });
});

const deleteAttribute = catchAsync(async (req: Request, res: Response) => {
  const { id, attributeId } = req.params;
  const result = await ProductAdminService.deleteAttribute({
    productId: id,
    attributeId: attributeId,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product attribute deleted successfully",
    data: result,
  });
});

const updateAttribute = catchAsync(async (req: Request, res: Response) => {
  const { id, attributeId } = req.params;
  const result = await ProductAdminService.updateAttribute({
    productId: id,
    attributeId: attributeId,
    data: req.body,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product attribute updated successfully",
    data: result,
  });
});

const addVariations = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductAdminService.addVariations({
    payload: {
      productId: +id,
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

const getVariations = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductAdminService.getVariations({ productId: id });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product variation retrieved successfully",
    data: result,
  });
});

const deleteVariation = catchAsync(async (req: Request, res: Response) => {
  const { id, variationId } = req.params;
  const result = await ProductAdminService.deleteVariation({
    productId: id,
    variationId: variationId,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product variation deleted successfully",
    data: result,
  });
});

const updateVariation = catchAsync(async (req: Request, res: Response) => {
  const { id, variationId } = req.params;
  const result = await ProductAdminService.updateVariation({
    productId: id,
    variationId: variationId,
    data: req.body,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product variation updated successfully",
    data: result,
  });
});

export const ProductAdminController = {
  create: createProduct,
  update: updateProduct,
  getAll: getProducts,
  delete: deleteProduct,
  addAttributes,
  getAttributes,
  deleteAttribute,
  updateAttribute,
  addVariations,
  getVariations,
  deleteVariation,
  updateVariation,
};
