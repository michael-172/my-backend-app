import AppError from "../../../errors/AppError";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import prisma from "../../../utils/prisma";
import { v4 as uuidv4 } from "uuid";

export const getAllCategories = async () => {
  try {
    const categories = await prisma.categories.findMany();
    return categories;
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to retrieve categories"
    );
  }
};

export const CategoriesService = {
  getAll: getAllCategories,
};
