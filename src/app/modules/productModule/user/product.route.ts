import { Router } from "express";
import { ProductController } from "./product.controller";
import { authMiddleware, authorize } from "../../../middlewares/auth";
import {
  createMulter,
  mapFilesToBody,
  mapProductAndVariantImages,
  parseMultipartFormFields,
} from "../../../middlewares/upload";

const router = Router();

// User Routes

// Admin Routes
const upload = createMulter({
  subdir: "products",
  accept: "images",
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
});

router.get("/all", ProductController.getAll);
router.get("/:id", ProductController.getOne);
router.get("/:id/reviews", ProductController.getReviews);

export const ProductRouter = router;
