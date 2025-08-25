import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { LoginPayload, SignUpPayload } from "./users.interface";
import bcrypt from "bcrypt";
import prisma from "../../utils/prisma";
import { v4 as uuidv4 } from "uuid";

export const getAllUsers = async () => {
  try {
    const users = await prisma.user.findMany();
    return users;
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to retrieve users"
    );
  }
};

export const UsersService = {
  getAllUsers,
};
