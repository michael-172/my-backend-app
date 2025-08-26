import express from "express";
import { AuthRouter } from "../modules/authModule/auth.route";
import { userAdminRouter } from "../modules/userModule/admin/users.route";
import { ProductRouter } from "../modules/productModule/user/product.route";
import { ProductAdminRouter } from "../modules/productModule/admin/product.route";
import { authMiddleware, authorize } from "../middlewares/auth";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRouter,
    isAuth: false,
    isAuthorizable: false,
  },
  {
    path: "/products",
    route: ProductRouter,
    isAuth: false,
    isAuthorizable: false,
  },
];

const adminRoutes = [
  //Admin Routes
  {
    path: "/products",
    route: ProductAdminRouter,
  },
  {
    path: "/users",
    route: userAdminRouter,
  },
];

moduleRoutes.forEach((route) =>
  router.use(
    route.path,
    route.isAuth ? authMiddleware : (req, res, next) => next(),
    route.isAuthorizable ? authorize("user") : (req, res, next) => next(),
    route.route
  )
);
adminRoutes.forEach((route) =>
  router.use(
    `/admins${route.path}`,
    authMiddleware,
    authorize("admin"),
    route.route
  )
);

export default router;
