import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authMiddleware, authorize } from "../../middlewares/auth";

const router = Router();

// User Routes
router.post("/login", AuthController.login("user"));
router.post("/register", AuthController.register("user"));

// Admin Routes
router.post("/admin/login", AuthController.login("admin"));
router.post(
  "/admin/create-user",
  authMiddleware,
  authorize("admin"),
  AuthController.register("admin")
);

export const AuthRouter = router;
