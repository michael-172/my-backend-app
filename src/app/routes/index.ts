import express from "express";
import { AuthRouter } from "../modules/authModule/user/auth.route";
import { AdminAuthRouter } from "../modules/authModule/admin/auth.route";
import { userAdminRouter } from "../modules/userModule/admin/users.route";
import { ProductRouter } from "../modules/productModule/user/product.route";
import { ProductAdminRouter } from "../modules/productModule/admin/product.route";
import { authMiddleware, authorize } from "../middlewares/auth";
import { categoryAdminRouter } from "../modules/categoriesModule/admin/category.route";
import { categoryRouter } from "../modules/categoriesModule/user/category.route";
import { cartRouter } from "../modules/cartModule/user/cart.route";
import { whishListRouter } from "../modules/whishListModule/user/whishlist.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRouter,
  },
  {
    path: "/products",
    route: ProductRouter,
  },
  {
    path: "/categories",
    route: categoryRouter,
  },
  {
    path: "/cart",
    route: cartRouter,
    isAuth: true,
    isAuthorizable: true,
  },
  {
    path: "/whishlist",
    route: whishListRouter,
    isAuth: true,
    isAuthorizable: true,
  },
];

const adminRoutes = [
  {
    path: "/auth",
    route: AdminAuthRouter,
    disableAuth: true,
    isAuthorizable: true,
  },
  {
    path: "/products",
    route: ProductAdminRouter,
  },
  {
    path: "/users",
    route: userAdminRouter,
  },
  {
    path: "/categories",
    route: categoryAdminRouter,
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
    !route.disableAuth ? authMiddleware : (req, res, next) => next(),
    !route.isAuthorizable ? authorize("admin") : (req, res, next) => next(),
    route.route
  )
);

export default router;
