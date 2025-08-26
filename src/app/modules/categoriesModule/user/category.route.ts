import { Router } from "express";
import { CategoryController } from "./category.controller";
import { authorize } from "../../../middlewares/auth";

const router = Router();

router.get("/", CategoryController.getAll);

export const categoryRouter = router;
