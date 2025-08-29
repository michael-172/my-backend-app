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

export const createCategory = async (data: any) => {
  try {
    const newCategory = await prisma.categories.create({
      data: {
        id: uuidv4(),
        ...data,
      },
    });
    return newCategory;
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to create category"
    );
  }
};

export const deleteCategory = async (id: string) => {
  try {
    await prisma.categories
      .findFirst({
        where: { id: +id },
      })
      .then(async (category) => {
        if (!category) {
          throw new AppError(httpStatus.NOT_FOUND, "Category not found");
        }
        await prisma.categories.delete({
          where: { id: +id },
        });
      });
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to delete category"
    );
  }
};

export const CategoriesService = {
  getAll: getAllCategories,
  create: createCategory,
  delete: deleteCategory,
};
