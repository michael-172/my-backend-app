import express from "express";
import { TestRoutes } from "../modules/testModule/test.route";
import { AuthRouter } from "../modules/authModule/auth.route";
import { UserRouter } from "../modules/usersModule/users.route";
import { ProductAdminController } from "../modules/productModule/admin/product.controller";
import { ProductRouter } from "../modules/productModule/user/product.route";
import { ProductAdminRouter } from "../modules/productModule/admin/product.route";
import { authMiddleware, authorize } from "../middlewares/auth";

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
  //Admin Routes
  {
    path: "/admins/products",
    route: ProductAdminRouter,
    isAuth: true,
    isAuthorizable: true,
  },
];

moduleRoutes.forEach((route) =>
  router.use(
    route.path,

    // if isAuth, apply authMiddleware
    route.isAuth ? authMiddleware : (req, res, next) => next(),
    route.isAuthorizable ? authorize("admin") : (req, res, next) => next(),
    route.route
  )
);

export default router;
