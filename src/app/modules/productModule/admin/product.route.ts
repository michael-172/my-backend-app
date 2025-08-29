import { Router } from "express";
import {
  createMulter,
  mapProductAndVariantImages,
  parseMultipartFormFields,
} from "../../../middlewares/upload";
import { ProductAdminController } from "./product.controller";
import { uploaderV2 } from "../../../middlewares/uploadV2";
import { expressYupMiddleware } from "express-yup-middleware";
import { createProductSchema } from "../../../validations/product";
import customErrorFormatter from "../../../middlewares/validate";

const router = Router();

const upload = createMulter({
  subdir: "products",
  accept: "images",
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
});

router.post(
  "/",
  uploaderV2({
    fieldName: "images",
    type: "array",
    maxCount: 4,
    destination: "uploads/products",
  }),
  expressYupMiddleware({
    schemaValidator: createProductSchema,
    errorFormatter: customErrorFormatter,
    expectedStatusCode: 422, // <-- This is the key change
  }),
  ProductAdminController.create
);
router.post("/:id/attributes", ProductAdminController.addAttributes);
router.post("/:id/variations", ProductAdminController.addVariations);

router.get("/", ProductAdminController.getAll);
router.delete("/:id", ProductAdminController.delete);

export const ProductAdminRouter = router;
