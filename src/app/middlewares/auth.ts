import { NextFunction, Request, Response } from "express";
import AppError from "../errors/AppError";
import https from "http-status";
import jwt from "jsonwebtoken";
import JWT_SECRET from "../config/index";
import prisma from "../utils/prisma";
// Usage: authorize("admin") or authorize("user", "admin")
export const authorize =
  (...roles: string[]) =>
  (
    req: Request & { user?: { role: string } },
    _res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return next(new AppError(https.UNAUTHORIZED, "Not authenticated"));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          https.FORBIDDEN,
          `Forbidden, Please Login with ${roles.join(" or ")} account`
        )
      );
    }
    next();
  };

export const authMiddleware = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError(https.UNAUTHORIZED, "Not authorized"));
  }

  const secret = JWT_SECRET.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  const decodedToken = jwt.verify(token, secret);

  const { id } = decodedToken as { id: string };

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  if (!user) {
    return next(new AppError(https.NOT_FOUND, "User not found"));
  }

  req.user = user;
  next();
};
