import { Request, Response } from "express";

import catchAsync from "../../../utils/asyncCatch";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { CategoriesService } from "./category.service";

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoriesService.getAll();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Categories retrieved successfully",
    data: result,
  });
});

export const CategoryController = {
  getAll: getAllCategories,
};
