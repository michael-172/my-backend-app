import jwt from "jsonwebtoken";
import config from "../config/index";
export const generateToken = (data: any) => {
  const secret = config.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  const token = jwt.sign(data, secret, {
    expiresIn: "1d",
  });
  return token;
};
