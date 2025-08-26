import { Router } from "express";
import {
  createMulter,
  mapProductAndVariantImages,
  parseMultipartFormFields,
} from "../../../middlewares/upload";
import { ProductAdminController } from "./product.controller";

const router = Router();

const upload = createMulter({
  subdir: "products",
  accept: "images",
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
});

router.post(
  "/create",
  upload.any(),
  parseMultipartFormFields(),
  mapProductAndVariantImages({
    productKey: "images",
    variantsKey: "variants",
    imageSubKey: "image",
  }),
  ProductAdminController.create
);

router.get("/", ProductAdminController.getAll);
router.delete("/:id", ProductAdminController.delete);

export const ProductAdminRouter = router;
