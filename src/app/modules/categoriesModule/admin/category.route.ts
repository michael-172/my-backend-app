import { Router } from "express";
import { CategoryAdminController } from "./category.controller";
import { authorize } from "../../../middlewares/auth";

const router = Router();

router.get("/", CategoryAdminController.getAll);
router.post("/", CategoryAdminController.create);
router.delete("/:id", CategoryAdminController.delete);

export const categoryAdminRouter = router;
