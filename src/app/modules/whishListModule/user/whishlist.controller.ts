import { Request, Response } from "express";

import catchAsync from "../../../utils/asyncCatch";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { WhishListService } from "./whishlist.service";

const getMyWhishList = catchAsync(
  async (req: Request & { user?: { id: string } }, res: Response) => {
    const result = await WhishListService.getMyWhishList({
      userId: req.user!.id,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Whishlist retrieved successfully",
      data: result,
    });
  }
);

const addToWhishList = catchAsync(
  async (req: Request & { user?: { id: string } }, res: Response) => {
    const result = await WhishListService.addToWhishList({
      userId: req.user!.id,
      productId: req.body.productId,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Item added to whishlist successfully",
      data: result,
    });
  }
);

const removeFromWhishList = catchAsync(
  async (req: Request & { user?: { id: string } }, res: Response) => {
    const result = await WhishListService.removeFromWhishList({
      userId: req.user!.id,
      whishListItemId: req.body.whishListItemId,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Item removed from whishlist successfully",
      data: result,
    });
  }
);

export const WhishListController = {
  getAll: getMyWhishList,
  add: addToWhishList,
  remove: removeFromWhishList,
};
