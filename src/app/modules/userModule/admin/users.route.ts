import { Router } from "express";
import { UserAdminController } from "./users.controller";
import { authorize } from "../../../middlewares/auth";

const router = Router();

// User Routes

// Admin Routes
router.get("/admin", UserAdminController.getAll);

export const userAdminRouter = router;
