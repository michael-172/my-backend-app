import { Router } from "express";
import { ProductController } from "./product.controller";
import { authMiddleware, authorize } from "../../middlewares/auth";
import {
  createMulter,
  mapFilesToBody,
  mapProductAndVariantImages,
  parseMultipartFormFields,
} from "../../middlewares/upload";

const router = Router();

// User Routes

// Admin Routes
const upload = createMulter({
  subdir: "products",
  accept: "images",
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
});

router.post(
  "/admin/create",
  authMiddleware,
  authorize("admin"),
  // Accept product-level images (field: images) and variant images (fields: variants[n][image])
  upload.any(),
  parseMultipartFormFields(),
  mapProductAndVariantImages({
    productKey: "images",
    variantsKey: "variants",
    imageSubKey: "image",
  }),
  ProductController.createProduct
);

export const ProductRouter = router;
