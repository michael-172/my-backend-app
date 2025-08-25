import { Router } from "express";
import { UserController } from "./users.controller";
import { authorize } from "../../middlewares/auth";

const router = Router();

// User Routes

// Admin Routes
router.get("/admin", authorize("admin"), UserController.getAllUsers);

export const UserRouter = router;
