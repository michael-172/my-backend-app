import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authMiddleware, authorize } from "../../../middlewares/auth";

const router = Router();

// User Routes
router.post("/login", AuthController.login("user"));
router.post("/register", AuthController.register("user"));

export const AuthRouter = router;
