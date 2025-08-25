import express from "express";
import { AuthRouter } from "../modules/authModule/auth.route";
import { UserRouter } from "../modules/usersModule/users.route";
import { ProductRouter } from "../modules/productModule/product.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRouter,
  },
  {
    path: "/users",
    route: UserRouter,
  },
  {
    path: "/products",
    route: ProductRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
