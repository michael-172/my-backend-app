import { NextFunction, Request, Response } from "express";

import { RequestHandler } from "express";
import catchAsync from "../../utils/asyncCatch";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { AuthService } from "./auth.service";

const login = (role: "user" | "admin"): RequestHandler =>
  catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.Login(req.body, role);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Login successful!",
      data: result,
    });
  });
const register = (role: "user" | "admin"): RequestHandler =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AuthService.SignUp(req.body, role);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Registration successful!",
      data: result,
    });
  });

export const AuthController = {
  login,
  register,
};
