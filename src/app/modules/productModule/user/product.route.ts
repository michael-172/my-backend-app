import { Router } from "express";
import { ProductController } from "./product.controller";
import { ProductAdminController } from "../admin/product.controller";

const router = Router();

router.get("/all", ProductAdminController.getAll);
router.get("/:id", ProductController.getOne);
router.get("/:id/reviews", ProductController.getReviews);

export const ProductRouter = router;
