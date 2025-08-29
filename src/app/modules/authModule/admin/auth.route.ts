import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authMiddleware, authorize } from "../../../middlewares/auth";

const router = Router();

// User Routes
router.post("/login", AuthController.login("admin"));
router.post(
  "/create-user",
  authMiddleware,
  authorize("admin"),
  AuthController.register("admin")
);

// Admin Routes

export const AdminAuthRouter = router;
