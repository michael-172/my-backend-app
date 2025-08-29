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
router.patch(
  "/:id",
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
  ProductAdminController.update
);
router.post("/:id/attributes", ProductAdminController.addAttributes);
router.get("/:id/attributes", ProductAdminController.getAttributes);
router.delete(
  "/:id/attributes/:attributeId",
  ProductAdminController.deleteAttribute
);
router.patch(
  "/:id/attributes/:attributeId",
  ProductAdminController.updateAttribute
);

router.post("/:id/variations", ProductAdminController.addVariations);
router.get("/:id/variations", ProductAdminController.getVariations);
router.delete(
  "/:id/variations/:variationId",
  ProductAdminController.deleteVariation
);
router.patch(
  "/:id/variations/:variationId",
  ProductAdminController.updateVariation
);

router.get("/", ProductAdminController.getAll);
router.delete("/:id", ProductAdminController.delete);

export const ProductAdminRouter = router;
