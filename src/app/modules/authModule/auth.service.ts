import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { LoginPayload, SignUpPayload } from "./auth.interface";
import bcrypt from "bcrypt";
import prisma from "../../utils/prisma";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import JWT_SECRET from "../../config/index";
import { generateToken } from "../../utils/generateToken";
const Login = async (
  { email, password }: LoginPayload,
  role: "user" | "admin"
) => {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
      role: role,
    },
  });
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid password");
  }

  const { password: _, ...userWithoutPassword } = user;
  const token = generateToken({ id: user.id });
  return {
    user: userWithoutPassword,
    token,
  };
};

const SignUp = async (
  { name, email, password }: SignUpPayload,
  role: "user" | "admin"
) => {
  const hashedPass = bcrypt.hashSync(password, 10);

  const user = {
    name,
    email,
    password: hashedPass,
    role,
  };

  await prisma.user.create({
    data: {
      id: uuidv4(),
      email: email,
      name: name,
      password: hashedPass,
      role,
      updatedAt: new Date(),
    },
  });
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const AuthService = {
  Login,
  SignUp,
};
